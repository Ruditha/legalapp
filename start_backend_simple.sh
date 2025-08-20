#!/bin/bash
echo "🚀 Starting Legal Document AI Backend..."

cd backend

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Start the backend server
echo "🌟 Starting backend server on http://localhost:8000..."
python3 main.py
