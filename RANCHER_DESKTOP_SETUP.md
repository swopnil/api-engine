# Rancher Desktop Configuration for API Maker Engine

## 🚀 Running with Rancher Desktop

### Prerequisites
1. Install [Rancher Desktop](https://rancherdesktop.io/)
2. Enable Kubernetes (optional) or just use Docker
3. Configure resource limits in Rancher Desktop settings:
   - Memory: 4GB minimum (8GB recommended)
   - CPU: 2 cores minimum (4 cores recommended)

### Quick Start Commands

#### Option 1: Full Stack with Docker Compose
```bash
# Start all services (backend + redis)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api-maker

# Stop services
docker-compose down
```

#### Option 2: Development Mode (Frontend separate)
```bash
# Start backend and redis only
docker-compose up -d api-maker redis

# In separate terminal, run frontend in development mode
cd apiengine
npm start
```

#### Option 3: Include Frontend Development Server
```bash
# Start all services including frontend dev server
docker-compose --profile dev up -d

# Access:
# - Backend: http://localhost:8000
# - Frontend Dev: http://localhost:3000 (with hot reload)
```

### Environment Variables
Create a `.env` file in the project root:

```bash
# OpenAI API Key (optional)
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (change in production)
JWT_SECRET=your-super-secure-jwt-secret-key

# Redis URL (for production)
REDIS_URL=redis://redis:6379
```

### Rancher Desktop Specific Optimizations

#### 1. Resource Limits
The docker-compose.yml includes optimized resource limits:
- API container: 1GB RAM, 0.5 CPU
- Redis container: 512MB RAM, 0.25 CPU

#### 2. Volume Optimizations
- Named volumes for better performance on macOS
- Cached volumes for node_modules to speed up builds

#### 3. Network Configuration
- Custom subnet (172.20.0.0/16) to avoid conflicts
- Bridge network for optimal container communication

### Build Commands

#### Build and Run
```bash
# Build the image
docker-compose build

# Build and start
docker-compose up --build -d

# Rebuild specific service
docker-compose build api-maker
```

#### Development Workflow
```bash
# For backend development (auto-reload)
docker-compose up -d redis
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# For frontend development
cd apiengine
npm start  # Runs on port 3000
```

### Troubleshooting

#### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Docker Socket Permission Issues**
   ```bash
   # Ensure Docker socket is accessible
   sudo chmod 666 /var/run/docker.sock
   ```

3. **Memory Issues**
   - Increase memory allocation in Rancher Desktop settings
   - Use `docker system prune` to clean up unused containers/images

4. **Slow Performance on macOS**
   - Use named volumes instead of bind mounts for node_modules
   - Enable "Use Rosetta for x86/amd64 emulation on Apple Silicon" in Rancher Desktop

#### Health Checks
```bash
# Check container health
docker-compose ps

# Check application health
curl http://localhost:8000/health

# Check Redis
docker-compose exec redis redis-cli ping
```

#### Logs and Debugging
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f api-maker

# Execute commands in containers
docker-compose exec api-maker bash
docker-compose exec redis redis-cli
```

### Performance Tips

1. **For Apple Silicon Macs:**
   - Enable Rosetta emulation in Rancher Desktop
   - Use arm64 base images when possible

2. **Memory Optimization:**
   - Limit container memory usage
   - Use Alpine Linux images
   - Clean up unused Docker objects regularly

3. **Development Speed:**
   - Use bind mounts for source code
   - Use named volumes for dependencies
   - Enable Docker BuildKit for faster builds

### Production Deployment

For production deployment with Rancher Desktop:

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With external database
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Useful Commands

```bash
# Clean up everything
docker-compose down -v --remove-orphans
docker system prune -af

# Update images
docker-compose pull
docker-compose up -d

# Scale services (if needed)
docker-compose up -d --scale api-maker=2

# Export/Import for backup
docker save api-engine-1_api-maker > api-maker-backup.tar
docker load < api-maker-backup.tar
```

This configuration is optimized for Rancher Desktop on macOS with better performance, resource management, and development workflow support.
