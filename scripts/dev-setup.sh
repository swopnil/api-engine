#!/bin/bash

# Development Setup Script for API Maker Engine

echo "🛠️ Setting up API Maker Engine for development..."

# Check Python version
python_version=$(python3 --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Python found: $python_version"
else
    echo "❌ Python 3 is required but not found"
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p templates
mkdir -p static

# Copy JSX file to static directory
if [ -f "ps-updated.jsx" ]; then
    echo "📋 Copying JSX component to static directory..."
    cp ps-updated.jsx static/
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your OpenAI API key"
    echo "   Required: OPENAI_API_KEY"
fi

# Start Redis in background (if available)
if command -v redis-server &> /dev/null; then
    echo "🔄 Starting Redis server..."
    redis-server --daemonize yes --port 6379
    echo "✅ Redis started on port 6379"
else
    echo "⚠️  Redis not found. Rate limiting will use in-memory storage."
fi

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "To start the development server:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Or run with uvicorn for auto-reload:"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "🌐 Application will be available at: http://localhost:8000"
echo ""
echo "📝 Don't forget to:"
echo "  1. Set your OpenAI API key in .env file"
echo "  2. Change JWT_SECRET in production"
echo "  3. Update admin password after first login"
