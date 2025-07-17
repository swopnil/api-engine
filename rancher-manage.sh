#!/bin/bash

# API Maker Engine - Rancher Desktop Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Rancher Desktop is running
check_rancher_desktop() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Rancher Desktop first."
        exit 1
    fi
    print_success "Rancher Desktop is running"
}

# Check if required files exist
check_requirements() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found in current directory"
        exit 1
    fi
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    
    print_success "Required files found"
}

# Build the application
build_app() {
    print_status "Building API Maker Engine..."
    docker-compose build --no-cache
    print_success "Build completed"
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose --profile dev up -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Backend API: http://localhost:8000"
    echo "  - Frontend Dev: http://localhost:3000 (with hot reload)"
    echo "  - Redis: localhost:6379"
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    print_success "Production environment started!"
    print_status "Application available at: http://localhost:8000"
}

# Start basic environment (backend + redis only)
start_basic() {
    print_status "Starting basic environment (backend + redis)..."
    docker-compose up -d api-maker redis
    
    print_success "Basic environment started!"
    print_status "Backend API available at: http://localhost:8000"
    print_warning "Run 'cd apiengine && npm start' for frontend development"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose --profile dev down
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "All services stopped"
}

# Show logs
show_logs() {
    local service=${1:-}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Show status
show_status() {
    print_status "Service status:"
    docker-compose ps
    
    print_status "Container health:"
    docker-compose exec api-maker curl -f http://localhost:8000/health 2>/dev/null && print_success "API is healthy" || print_warning "API health check failed"
}

# Clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Show help
show_help() {
    echo "API Maker Engine - Rancher Desktop Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev        Start development environment (with frontend hot reload)"
    echo "  prod       Start production environment"
    echo "  basic      Start basic environment (backend + redis only)"
    echo "  build      Build the application"
    echo "  stop       Stop all services"
    echo "  logs       Show logs for all services"
    echo "  logs <svc> Show logs for specific service (api-maker, redis, frontend-dev)"
    echo "  status     Show service status and health"
    echo "  cleanup    Stop services and clean up Docker resources"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                 # Start development environment"
    echo "  $0 logs api-maker      # Show API logs"
    echo "  $0 status              # Check service status"
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        "dev")
            check_rancher_desktop
            check_requirements
            start_dev
            ;;
        "prod")
            check_rancher_desktop
            check_requirements
            start_prod
            ;;
        "basic")
            check_rancher_desktop
            check_requirements
            start_basic
            ;;
        "build")
            check_rancher_desktop
            check_requirements
            build_app
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            show_logs $2
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
