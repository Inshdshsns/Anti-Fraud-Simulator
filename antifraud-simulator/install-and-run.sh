#!/bin/bash

# Anti-Fraud Simulator - Installer Script

echo "============================================"
echo "  Anti-Fraud Simulator - Installer"
echo "============================================"
echo ""

# Проверка наличия Node.js
echo "[1/4] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo ""
    echo "ERROR: Node.js not found!"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi
echo "Node.js found: $(node --version)"
echo ""

# Переход в директорию скрипта
cd "$(dirname "$0")"

echo "[2/4] Installing dependencies..."
echo ""

# Установка зависимостей
npm install --prefer-offline
if [ $? -ne 0 ]; then
    echo ""
    echo "Trying mirror registry..."
    npm install --registry https://registry.npmmirror.com
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
fi
echo ""
echo "Dependencies installed!"
echo ""

# Запуск dev-сервера
echo "[3/4] Starting server..."
echo ""

# Запуск в фоне
npm run dev &
SERVER_PID=$!

# Ожидание запуска сервера
echo "[4/4] Waiting for server to start..."
sleep 5

# Открытие браузера
echo ""
echo "Opening browser..."

# Определение ОС и открытие браузера
case "$(uname -s)" in
    Linux*)     xdg-open http://localhost:5173 2>/dev/null || sensible-browser http://localhost:5173 2>/dev/null || echo "Please open http://localhost:5173 in your browser";;
    Darwin*)    open http://localhost:5173;;
    *)          echo "Please open http://localhost:5173 in your browser";;
esac

echo ""
echo "============================================"
echo "  Server is running!"
echo "  URL: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop the server"
echo "============================================"
echo ""

# Ожидание завершения
wait $SERVER_PID
