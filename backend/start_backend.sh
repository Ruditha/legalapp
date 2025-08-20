#!/bin/bash
# Backend startup script for Legal Awareness App

echo "🚀 Legal Awareness App - Backend Startup"
echo "========================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed"
    exit 1
fi

echo "✅ pip found"

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found, copying from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys"
fi

# Test the API integration
echo "🧪 Testing API integration..."
python3 test_gemini.py

if [ $? -ne 0 ]; then
    echo "⚠️ API test had issues, but continuing..."
fi

# Start the server
echo "🌟 Starting backend server..."
echo "Backend will be available at: http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"

uvicorn main:app --reload --host 0.0.0.0 --port 8000
