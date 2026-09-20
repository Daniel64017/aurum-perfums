@echo off
title Aurum Parfums - Backend FastAPI
cd /d "%~dp0backend"
echo ========================================================
echo   Iniciando Backend FastAPI da Aurum Parfums (Porta 8000)...
echo ========================================================
python app/main.py
pause
