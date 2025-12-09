@echo off
echo Starting FastAPI backend...
uvicorn app.main:app --reload
pause
