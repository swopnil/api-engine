# scripts/deploy.sh
#!/bin/bash

# API Maker Engine Deployment Script

set -e

echo "🚀 Starting API Maker Engine deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your OpenAI API key and other settings"
    echo "   Required: OPENAI_API_KEY"
    echo "   Recommended: Change JWT_SECRET for production"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p templates
mkdir -p static

# Load environment variables
if [ -f .env ]; then
    echo "🔧 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your-openai-api-key-here" ]; then
    echo "❌ OpenAI API key not set!"
    echo "   Please set OPENAI_API_KEY in your .env file"
    echo "   You can get an API key from: https://platform.openai.com/api-keys"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🎉 API Maker Engine is ready!"
    echo ""
    echo "   🌐 Web Interface: http://localhost:8000"
    echo "   📊 API Endpoints: http://localhost:8000/api"
    echo "   📚 Health Check: http://localhost:8000/health"
    echo ""
    echo "   Default credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "📝 Quick Start:"
    echo "   1. Open http://localhost:8000 in your browser"
    echo "   2. Login with admin/admin123"
    echo "   3. Create your first API using natural language"
    echo "   4. Deploy and test it instantly!"
    echo ""
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create data directory
mkdir -p data

# Build and start services
echo "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ API Maker Engine is running!"
    echo "🌐 Access the application at: http://localhost:8000"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo "📊 Health Check: http://localhost:8000/health"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi

