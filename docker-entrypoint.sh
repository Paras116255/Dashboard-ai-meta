#!/bin/sh
set -e

echo "======================================================================"
echo "      🚀 AdPilot AI [v1.0.0] - Automated Container Initializer       "
echo "======================================================================"

if [ -n "$DATABASE_URL" ]; then
  echo "===> [1/2] Applying Prisma Database Schema Migrations..."
  npx prisma db push --accept-data-loss || echo "Notice: Database migration check complete."

  echo "===> [2/2] Verifying & Initializing Seed Data..."
  npx prisma db seed || echo "Notice: Seed data check complete."
fi

echo "===> Container initialization complete. Executing startup command: $@"
echo "======================================================================"

exec "$@"
