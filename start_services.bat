@echo off
echo Starting E-commerce Website Services...
echo.

echo Starting Chatbot Backend (Python FastAPI)...
start "Chatbot Backend" cmd /k "cd chatbot & python -m uvicorn chatbot:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (React/Vite)...
start "Frontend" cmd /k "cd frontend & npm run dev"

echo.
echo Services are starting up...
echo - Chatbot Backend: http://localhost:8000
echo - Frontend: http://localhost:5175 (or next available port)
echo.
echo Press any key to exit this script (services will continue running)
pause > nul
