#!/bin/bash

PORT=${PORT:-8000}

echo "Iniciando FastAPI en el puerto $PORT"

gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
