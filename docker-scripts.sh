#!/bin/bash

# ClinicalGoTo Docker Management Scripts
# This file contains helpful scripts for managing Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Build the Docker image
build() {
    print_header "Building ClinicalGoTo Docker Image"
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before running."
    fi
    
    docker build -t clinicalgoto:latest .
    print_status "Build completed successfully!"
}

# Start the application in development mode
dev() {
    print_header "Starting ClinicalGoTo in Development Mode"
    
    # Ensure logs directory exists
    mkdir -p logs
    
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
}

# Start the application in production mode
prod() {
    print_header "Starting ClinicalGoTo in Production Mode"
    
    # Ensure logs directory exists
    mkdir -p logs
    
    docker-compose up -d --build
    print_status "Application started in production mode"
    print_status "Access the application at: http://localhost:3000"
}

# Start with Nginx reverse proxy
prod_nginx() {
    print_header "Starting ClinicalGoTo with Nginx Reverse Proxy"
    
    # Ensure logs directory exists
    mkdir -p logs
    
    docker-compose --profile production up -d --build
    print_status "Application started with Nginx reverse proxy"
    print_status "Access the application at: http://localhost"
}

# Start with database
with_db() {
    print_header "Starting ClinicalGoTo with Database"
    
    # Ensure logs directory exists
    mkdir -p logs
    
    docker-compose --profile database up -d --build
    print_status "Application started with PostgreSQL database"
    print_status "Database: postgresql://clinicalgoto:clinicalgoto123@localhost:5432/clinicalgoto"
}

# Stop all services
stop() {
    print_header "Stopping ClinicalGoTo Services"
    
    docker-compose down
    print_status "All services stopped"
}

# Clean up containers and images
clean() {
    print_header "Cleaning Up Docker Resources"
    
    print_status "Stopping and removing containers..."
    docker-compose down -v --remove-orphans
    
    print_status "Removing unused images..."
    docker image prune -f
    
    print_status "Cleanup completed"
}

# View logs
logs() {
    print_header "Viewing Application Logs"
    
    if [ "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f clinicalgoto
    fi
}

# Show status of services
status() {
    print_header "Service Status"
    
    docker-compose ps
    
    print_status "\nContainer health status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Execute shell in container
shell() {
    print_header "Opening Shell in ClinicalGoTo Container"
    
    docker-compose exec clinicalgoto /bin/sh
}

# Run tests
test() {
    print_header "Running Tests"
    
    docker-compose exec clinicalgoto npm test
}

# Backup data
backup() {
    print_header "Creating Backup"
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker-compose ps postgres | grep -q "Up"; then
        print_status "Backing up PostgreSQL database..."
        docker-compose exec postgres pg_dump -U clinicalgoto clinicalgoto > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup Redis data if running
    if docker-compose ps redis | grep -q "Up"; then
        print_status "Backing up Redis data..."
        docker-compose exec redis redis-cli BGSAVE
        docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/"
    fi
    
    print_status "Backup created in $BACKUP_DIR"
}

# Restore from backup
restore() {
    if [ -z "$1" ]; then
        print_error "Please provide backup directory path"
        print_status "Usage: $0 restore <backup_directory>"
        exit 1
    fi
    
    print_header "Restoring from Backup: $1"
    
    if [ -f "$1/database.sql" ]; then
        print_status "Restoring PostgreSQL database..."
        docker-compose exec -T postgres psql -U clinicalgoto clinicalgoto < "$1/database.sql"
    fi
    
    if [ -f "$1/dump.rdb" ]; then
        print_status "Restoring Redis data..."
        docker-compose stop redis
        docker cp "$1/dump.rdb" $(docker-compose ps -q redis):/data/
        docker-compose start redis
    fi
    
    print_status "Restore completed"
}

# Show help
help() {
    print_header "ClinicalGoTo Docker Management Commands"
    
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  build       Build the Docker image"
    echo "  dev         Start in development mode with hot reloading"
    echo "  prod        Start in production mode"
    echo "  prod-nginx  Start with Nginx reverse proxy"
    echo "  with-db     Start with PostgreSQL database"
    echo "  stop        Stop all services"
    echo "  clean       Clean up containers and images"
    echo "  logs [svc]  View logs (optionally for specific service)"
    echo "  status      Show service status"
    echo "  shell       Open shell in main container"
    echo "  test        Run tests"
    echo "  backup      Create backup of data"
    echo "  restore     Restore from backup"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                  # Start development environment"
    echo "  $0 prod                 # Start production environment"
    echo "  $0 logs                 # View application logs"
    echo "  $0 logs postgres        # View database logs"
    echo "  $0 backup               # Create backup"
    echo "  $0 restore backups/20231210_143022  # Restore from backup"
}

# Main command handler
case "$1" in
    build)      build ;;
    dev)        dev ;;
    prod)       prod ;;
    prod-nginx) prod_nginx ;;
    with-db)    with_db ;;
    stop)       stop ;;
    clean)      clean ;;
    logs)       logs "$2" ;;
    status)     status ;;
    shell)      shell ;;
    test)       test ;;
    backup)     backup ;;
    restore)    restore "$2" ;;
    help|*)     help ;;
esac
