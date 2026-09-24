param (
    [string]$Username = "paras116255",
    [string]$Tag = "v1.0.0"
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " 📦 AdPilot AI - Docker Hub Container Build & Push Pipeline" -ForegroundColor Cyan
Write-Host " Target Username: $Username" -ForegroundColor Yellow
Write-Host " Target Tag:      $Tag" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Build Web & Worker Docker Images
Write-Host "`n===> [1/4] Building Web Application Docker Image..." -ForegroundColor Green
docker build -t "$Username/adpilot-web:$Tag" -t "$Username/adpilot-web:latest" .

Write-Host "`n===> [2/4] Building Background Worker Docker Image..." -ForegroundColor Green
docker build -t "$Username/adpilot-worker:$Tag" -t "$Username/adpilot-worker:latest" .

# 2. Push to Docker Hub
Write-Host "`n===> [3/4] Pushing Web Application Image to Docker Hub..." -ForegroundColor Green
docker push "$Username/adpilot-web:$Tag"
docker push "$Username/adpilot-web:latest"

Write-Host "`n===> [4/4] Pushing Background Worker Image to Docker Hub..." -ForegroundColor Green
docker push "$Username/adpilot-worker:$Tag"
docker push "$Username/adpilot-worker:latest"

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " 🎉 SUCCESS! Docker Hub images published:" -ForegroundColor Green
Write-Host "   • $Username/adpilot-web:$Tag" -ForegroundColor Yellow
Write-Host "   • $Username/adpilot-web:latest" -ForegroundColor Yellow
Write-Host "   • $Username/adpilot-worker:$Tag" -ForegroundColor Yellow
Write-Host "   • $Username/adpilot-worker:latest" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
