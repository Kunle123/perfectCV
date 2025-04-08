@echo off
set ENV_FILE=tests/.env.test
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 