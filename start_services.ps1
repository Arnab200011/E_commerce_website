Write-Host "Starting E-commerce Website Services..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Chatbot Backend (Python FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\chatbot'; python -m uvicorn chatbot:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Waiting 5 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Starting Frontend (React/Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "Services are starting up..." -ForegroundColor Green
Write-Host "- Chatbot Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5175 (or next available port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script (services will continue running)" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
