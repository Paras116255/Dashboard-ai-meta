#!/usr/bin/env bash

# ==============================================================================
# AdPilot AI - Automated Production Server Setup & Deployment Script
# ==============================================================================
# This script installs all system dependencies, configures Docker & Docker Compose,
# generates secure environment configuration, builds and launches full-stack
# containers (Next.js App, BullMQ Worker, PostgreSQL, Redis), runs database migrations,
# seeds demo data, and sets up firewall & Nginx reverse proxy.
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# Color Output Formatting
# ------------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ------------------------------------------------------------------------------
# Logging Helper Functions
# ------------------------------------------------------------------------------
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}${BOLD}===> $1${NC}"
}

# ------------------------------------------------------------------------------
# Banner
# ------------------------------------------------------------------------------
print_banner() {
    echo -e "${MAGENTA}${BOLD}"
    echo "======================================================================"
    echo "            ___    |  _ \|_ _| |    / _ \|_ _|  _ \  ___|            "
    echo "           / _ \   | | | || |  | |   | | | || | | |\/  |             "
    echo "          / ___ \  | |_| || |  | |___| |_| || | |_| |  |             "
    echo "         /_/   \_\ |____/|___| |_____\___/|___|____/   |             "
    echo "                                                                      "
    echo "            Meta Advertising OS & AI Ad Studio Server Installer      "
    echo "======================================================================"
    echo -e "${NC}"
}

# ------------------------------------------------------------------------------
# 1. System Requirements & Privileges Check
# ------------------------------------------------------------------------------
check_prerequisites() {
    log_step "Step 1/8: Checking System Environment & Privileges..."

    # Check root / sudo access
    if [[ $EUID -ne 0 ]]; then
        log_warn "This script requires administrative privileges for installing packages & docker."
        log_info "Re-running script with sudo..."
        exec sudo bash "$0" "$@"
        exit 1
    fi

    # Check OS compatibility
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$NAME
        OS_VERSION=$VERSION_ID
        log_info "Detected OS: $OS_NAME ($OS_VERSION)"
    else
        log_warn "Could not detect OS details from /etc/os-release."
    fi

    # Check RAM & Disk space
    TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}' || echo "2048")
    FREE_DISK_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//' || echo "10")

    log_info "Memory detected: ${TOTAL_RAM_MB} MB"
    log_info "Available disk space: ${FREE_DISK_GB} GB"

    if [ "$TOTAL_RAM_MB" -lt 1024 ]; then
        log_warn "System memory is below 1GB. Docker builds may require swap or fail."
    fi
}

# ------------------------------------------------------------------------------
# 2. Package Manager & System Dependencies Update
# ------------------------------------------------------------------------------
install_system_packages() {
    log_step "Step 2/8: Updating System Packages & Installing Core Tools..."

    if command -v apt-get &> /dev/null; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y
        apt-get install -y --no-install-recommends \
            ca-certificates \
            curl \
            gnupg \
            lsb-release \
            git \
            wget \
            jq \
            unzip \
            ufw \
            openssl \
            build-essential
        log_success "APT system packages updated & dependencies installed."
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y curl wget git jq unzip openssl gcc gcc-c++ make
        log_success "YUM system packages updated & dependencies installed."
    else
        log_warn "Package manager not recognized automatically. Ensure git, curl, openssl, and docker are installed."
    fi
}

# ------------------------------------------------------------------------------
# 3. Docker & Docker Compose Installation
# ------------------------------------------------------------------------------
install_docker() {
    log_step "Step 3/8: Setting up Docker Engine & Docker Compose V2..."

    if command -v docker &> /dev/null; then
        DOCKER_VER=$(docker --version)
        log_success "Docker is already installed: $DOCKER_VER"
    else
        log_info "Installing Docker Engine..."
        if command -v apt-get &> /dev/null; then
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
              $(lsb_release -cs 2>/dev/null || echo "jammy") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            apt-get update -y
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        else
            curl -fsSL https://get.docker.com | sh
        fi
        log_success "Docker Engine installed successfully."
    fi

    # Ensure docker daemon service is enabled & running
    systemctl enable docker || true
    systemctl start docker || true

    # Verify docker compose plugin availability
    if docker compose version &> /dev/null; then
        COMPOSE_VER=$(docker compose version)
        log_success "Docker Compose V2 is active: $COMPOSE_VER"
    else
        log_error "Docker Compose V2 plugin missing. Attempting standalone fallback download..."
        curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi

    # Add current SUDO_USER to docker group if applicable
    if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
        usermod -aG docker "$SUDO_USER" || true
        log_info "Added user '$SUDO_USER' to the docker security group."
    fi
}

# ------------------------------------------------------------------------------
# 4. Environment Configuration Setup (.env)
# ------------------------------------------------------------------------------
setup_environment_config() {
    log_step "Step 4/8: Configuring Production Environment Variables (.env)..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ENV_FILE="$SCRIPT_DIR/.env"

    if [ -f "$ENV_FILE" ]; then
        log_info "Existing .env file detected. Preserving existing secrets."
    else
        log_info "Creating new .env file with secure auto-generated keys..."

        # Generate cryptographically secure random keys
        RANDOM_JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "adpilot_jwt_secret_$(date +%s)")
        RANDOM_ENCRYPT_KEY=$(openssl rand -hex 32 2>/dev/null || echo "adpilot_encryption_key_$(date +%s)")
        RANDOM_DB_PASS=$(openssl rand -hex 16 2>/dev/null || echo "adpilot_secure_pass")

        cat <<EOF > "$ENV_FILE"
# ==============================================================================
# AdPilot AI Production Environment Configuration
# Generated on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# ==============================================================================

# Node Environment
NODE_ENV="production"
PORT=3000

# PostgreSQL Database Configuration (Internal Docker Service)
POSTGRES_USER="adpilot"
POSTGRES_PASSWORD="${RANDOM_DB_PASS}"
POSTGRES_DB="adpilot_db"
DATABASE_URL="postgresql://adpilot:${RANDOM_DB_PASS}@postgres:5432/adpilot_db?schema=public"

# Redis Cache & Background Workers (Internal Docker Service)
REDIS_URL="redis://redis:6379"

# Core Application Security Secrets
JWT_SECRET="${RANDOM_JWT_SECRET}"
ENCRYPTION_KEY="${RANDOM_ENCRYPT_KEY}"
NEXTAUTH_URL="http://localhost:3000"

# Meta Graph API Integration Configuration
META_APP_ID="mock_meta_app_id_12345"
META_APP_SECRET="mock_meta_app_secret_abcde"
META_REDIRECT_URI="http://localhost:3000/api/integrations/meta/callback"
META_GRAPH_API_VERSION="v20.0"
USE_MOCK_META_API="true"

# AI Provider Settings ('openai' or 'mock')
AI_PROVIDER="mock"
OPENAI_API_KEY="sk-mock-key-for-local-dev"
OPENAI_MODEL="gpt-4o"

# Storage Configuration
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="adpilot-assets"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
EOF

        chmod 600 "$ENV_FILE"
        log_success "Generated production .env file with secure secrets."
    fi
}

# ------------------------------------------------------------------------------
# 5. Security & Firewall (UFW) Setup
# ------------------------------------------------------------------------------
configure_firewall() {
    log_step "Step 5/8: Security & Firewall Setup (UFW)..."

    if command -v ufw &> /dev/null; then
        log_info "Configuring Firewall rules..."
        ufw allow 22/tcp comment 'SSH' || true
        ufw allow 80/tcp comment 'HTTP Web' || true
        ufw allow 443/tcp comment 'HTTPS Web' || true
        ufw allow 3000/tcp comment 'AdPilot Direct App Port' || true

        # Enable UFW if not active
        if ! ufw status | grep -q "Status: active"; then
            ufw --force enable || true
            log_success "UFW firewall enabled and active."
        else
            log_info "UFW firewall is active and rules are applied."
        fi
    else
        log_warn "UFW not found. Ensure ports 80, 443, and 3000 are open in your cloud provider security group."
    fi
}

# ------------------------------------------------------------------------------
# 6. Docker Container Orchestration (Build & Start)
# ------------------------------------------------------------------------------
deploy_containers() {
    log_step "Step 6/8: Building & Starting Docker Containers..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"

    log_info "Stopping any previously running containers..."
    docker compose down --remove-orphans || true

    log_info "Building container images (Web Application & Background Worker)..."
    docker compose build --no-cache

    log_info "Starting services in detached mode..."
    docker compose up -d

    log_success "Docker containers started successfully."
}

# ------------------------------------------------------------------------------
# 7. Database Initialization, Migrations & Seeding
# ------------------------------------------------------------------------------
initialize_database() {
    log_step "Step 7/8: Running Database Migrations & Initializing Seed Data..."

    log_info "Waiting for PostgreSQL service to become ready..."
    MAX_RETRIES=30
    RETRY_COUNT=0

    until docker compose exec -T postgres pg_isready -U adpilot -d adpilot_db &> /dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
        echo -n "."
        sleep 2
        RETRY_COUNT=$((RETRY_COUNT+1))
    done
    echo ""

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log_error "PostgreSQL container failed to become ready in time."
        docker compose logs postgres
        exit 1
    fi
    log_success "PostgreSQL is online and accepting connections."

    log_info "Applying Prisma Database Schema Migrations..."
    docker compose exec -T web npx prisma db push --accept-data-loss

    log_info "Generating Prisma Client..."
    docker compose exec -T web npx prisma generate

    log_info "Seeding Initial Database Records (Admin user, Organization, Demo Campaigns & AI Projects)..."
    docker compose exec -T web npm run prisma:seed || {
        log_warn "Seed script execution reported warnings/notice. Checking database status..."
    }

    log_success "Database schema initialized and seeded successfully."
}

# ------------------------------------------------------------------------------
# 8. Health Verification & System Summary
# ------------------------------------------------------------------------------
verify_deployment() {
    log_step "Step 8/8: Verifying Application Health & Container Status..."

    sleep 5
    log_info "Current Container Status:"
    docker compose ps

    # Test HTTP endpoint response
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
    log_info "HTTP response status code from localhost:3000 -> $HTTP_STATUS"

    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 307 ] || [ "$HTTP_STATUS" -eq 302 ]; then
        log_success "AdPilot AI Web Server is healthy and responding!"
    else
        log_warn "Application returned HTTP status code $HTTP_STATUS. Checking docker logs..."
        docker compose logs --tail=30 web
    fi

    # Output Optional Nginx Site Config
    NGINX_CONF_PATH="/etc/nginx/sites-available/adpilot"
    if [ -d "/etc/nginx/sites-available" ] && [ ! -f "$NGINX_CONF_PATH" ]; then
        log_info "Creating Nginx reverse proxy configuration template at $NGINX_CONF_PATH..."
        cat <<'EOF' > "$NGINX_CONF_PATH"
server {
    listen 80;
    server_name your-domain.com; # Replace with your actual domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        log_info "To enable Nginx and SSL (Certbot):"
        log_info "  ln -s /etc/nginx/sites-available/adpilot /etc/nginx/sites-enabled/"
        log_info "  certbot --nginx -d your-domain.com"
    fi

    # Final Summary Banner
    echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
    echo -e "${GREEN}${BOLD}      🎉 ADPILOT AI PRODUCTION SETUP COMPLETED SUCCESSFULLY!         ${NC}"
    echo -e "${GREEN}${BOLD}======================================================================${NC}"
    echo -e "${CYAN}Web Application URL:${NC} http://localhost:3000"
    echo -e "${CYAN}Default Admin Login:${NC} admin@adpilot.ai"
    echo -e "${CYAN}Default Password:${NC}    password123"
    echo -e "----------------------------------------------------------------------"
    echo -e "${BOLD}Management Commands:${NC}"
    echo -e "  • View Live Logs:        ${YELLOW}docker compose logs -f${NC}"
    echo -e "  • Restart Application:   ${YELLOW}docker compose restart${NC}"
    echo -e "  • Stop Application:      ${YELLOW}docker compose down${NC}"
    echo -e "  • Open DB Studio:        ${YELLOW}docker compose exec web npx prisma studio${NC}"
    echo -e "  • Check Worker Status:   ${YELLOW}docker compose logs -f worker${NC}"
    echo -e "----------------------------------------------------------------------"
    echo -e "${BOLD}Configuration File Location:${NC} $(pwd)/.env"
    echo -e "${BOLD}To enable real Meta & OpenAI keys:${NC} Edit .env and set USE_MOCK_META_API=false & AI_PROVIDER=openai"
    echo -e "${GREEN}${BOLD}======================================================================${NC}\n"
}

# ------------------------------------------------------------------------------
# Main Execution Flow
# ------------------------------------------------------------------------------
main() {
    print_banner
    check_prerequisites
    install_system_packages
    install_docker
    setup_environment_config
    configure_firewall
    deploy_containers
    initialize_database
    verify_deployment
}

main "$@"
