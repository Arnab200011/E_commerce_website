@echo off
setlocal
echo Starting E-commerce Website Services...
echo.

echo Starting Chatbot Backend (Python FastAPI)...
start "Chatbot Backend" cmd /k cd /d "%~dp0chatbot" ^& python -m uvicorn chatbot:app --host 0.0.0.0 --port 8000 --reload

echo Starting Recommendation Service (Python FastAPI)...
start "Recommend Service" cmd /k cd /d "%~dp0recommend" ^& python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload

echo Starting Backend API (Node.js)...
start "Backend API" cmd /k cd /d "%~dp0backend" ^& set PORT=5001 ^& set FRONTEND_URLS=http://localhost:5173,http://localhost:5174,http://localhost:5175 ^& npm run dev

echo Starting Auth Service (Node.js)...
start "Auth Service" cmd /k cd /d "%~dp0auth_system" ^& set PORT=5002 ^& set FRONTEND_URL=http://localhost:5174 ^& node server.js

echo Starting Frontend (React/Vite)...
start "Frontend" cmd /k cd /d "%~dp0frontend" ^& npm run dev

echo.
echo Services are starting up...
echo - Chatbot Backend: http://localhost:8000
echo - Recommend Service: http://localhost:8001/recommend
echo - Backend API: http://localhost:5001
echo - Auth Service: http://localhost:5002
echo - Frontend: http://localhost:5174 (or next available port)
echo.
pause > nul
