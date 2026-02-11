#!/bin/sh
set -e

echo "Starting uvicorn backend..."
uvicorn main:app --host 127.0.0.1 --port 8080 &

echo "Starting nginx on port 10000..."
nginx -g "daemon off;"
