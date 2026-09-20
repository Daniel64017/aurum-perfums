@echo off
title Aurum Parfums - Iniciar Sistema Completo
cd /d "%~dp0"
echo ========================================================
echo   Iniciando Backend e Frontend da Aurum Parfums...
echo ========================================================
start "Aurum Backend (8000)" cmd /k "iniciar_backend.bat"
timeout /t 3
start "Aurum Frontend (5173)" cmd /k "iniciar_frontend.bat"
echo.
echo O backend e o frontend foram iniciados em janelas separadas!
echo Acesse a loja no seu navegador em: http://localhost:5173
echo.
