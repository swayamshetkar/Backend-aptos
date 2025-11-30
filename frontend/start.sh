#!/bin/bash

# Quick Start Script for AdMarket Frontend

echo "========================================="
echo "🚀 AdMarket Frontend Quick Start"
echo "========================================="
echo ""

# Check if backend is running
echo "📡 Checking if backend is running..."
if curl -s http://localhost:4000/ > /dev/null 2>&1; then
    echo "✅ Backend is running on port 4000"
else
    echo "❌ Backend is NOT running!"
    echo "Please start the backend first:"
    echo "   cd /home/chidori/backendyoutube"
    echo "   npm run dev"
    exit 1
fi

echo ""
echo "🌐 Starting frontend..."
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Starting HTTP server on port 8080..."
    echo "📱 Open your browser and visit:"
    echo ""
    echo "   👉 http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd "$(dirname "$0")"
    python3 -m http.server 8080
else
    echo "ℹ️  Python not found. Opening index.html directly..."
    cd "$(dirname "$0")"
    
    # Try to open in browser
    if command -v xdg-open &> /dev/null; then
        xdg-open index.html
    elif command -v open &> /dev/null; then
        open index.html
    elif command -v explorer.exe &> /dev/null; then
        explorer.exe index.html
    else
        echo "Please open frontend/index.html in your browser manually"
    fi
fi
