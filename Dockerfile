
# Multi-stage Dockerfile optimized for Rancher Desktop
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY apiengine/package*.json ./
RUN npm ci --only=production

# Copy frontend source and build
COPY apiengine/ ./
RUN npm run build

# Python runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Docker CLI (optimized for Rancher Desktop)
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm get-docker.sh

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p /app/templates /app/data /app/static

# Copy built frontend files from previous stage
COPY --from=frontend-builder /app/frontend/build /app/static

# Copy application files
COPY main.py .
COPY templates/ ./templates/
COPY api/ ./api/

# Set environment variables
ENV PYTHONPATH=/app \
    DATABASE_URL=sqlite:///data/api_maker.db \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

