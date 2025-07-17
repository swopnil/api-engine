#!/bin/bash

# Frontend Integration Setup Script
# This script sets up the integrated frontend-backend system

echo "🚀 Setting up API Maker Engine Frontend Integration..."

# Navigate to the React app directory
cd "$(dirname "$0")/apiengine"

echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building React application..."
npm run build

echo "🔄 Copying build files to static directory..."
# Ensure static directory exists
mkdir -p ../static

# Copy build files
cp -r build/* ../static/ 2>/dev/null || true

echo "✅ Frontend integration setup complete!"

echo ""
echo "🎉 Your API Maker Engine is ready!"
echo ""
echo "To start the application:"
echo "1. Activate your Python virtual environment"
echo "2. Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "3. Open: http://localhost:8000"
echo ""
echo "Features included:"
echo "✓ JWT Authentication (demo: admin/admin123)"
echo "✓ User-specific API management"
echo "✓ AI-powered code generation"
echo "✓ API testing playground"
echo "✓ Real-time analytics"
echo "✓ Modern React frontend"
echo ""
echo "For development mode:"
echo "cd apiengine && npm start (runs on port 3000)"
echo "Backend will run on port 8000"
