# ClinicalGoTo Docker Management Scripts for Windows PowerShell
# This file contains helpful scripts for managing Docker containers on Windows

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("build", "dev", "prod", "prod-nginx", "with-db", "stop", "clean", "logs", "status", "shell", "test", "backup", "restore", "help")]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Parameter
)

# Colors for output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "================================" -ForegroundColor Blue
    Write-Host " $Message" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
}

# Build the Docker image
function Build {
    Write-Header "Building ClinicalGoTo Docker Image"
    
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Warning "Please edit .env file with your configuration before running."
    }
    
    docker build -t clinicalgoto:latest .
    Write-Status "Build completed successfully!"
}

# Start the application in development mode
function Dev {
    Write-Header "Starting ClinicalGoTo in Development Mode"
    
    # Ensure logs directory exists
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
}

# Start the application in production mode
function Prod {
    Write-Header "Starting ClinicalGoTo in Production Mode"
    
    # Ensure logs directory exists
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    docker-compose up -d --build
    Write-Status "Application started in production mode"
    Write-Status "Access the application at: http://localhost:3000"
}

# Start with Nginx reverse proxy
function Prod-Nginx {
    Write-Header "Starting ClinicalGoTo with Nginx Reverse Proxy"
    
    # Ensure logs directory exists
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    docker-compose --profile production up -d --build
    Write-Status "Application started with Nginx reverse proxy"
    Write-Status "Access the application at: http://localhost"
}

# Start with database
function With-Db {
    Write-Header "Starting ClinicalGoTo with Database"
    
    # Ensure logs directory exists
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    docker-compose --profile database up -d --build
    Write-Status "Application started with PostgreSQL database"
    Write-Status "Database: postgresql://clinicalgoto:clinicalgoto123@localhost:5432/clinicalgoto"
}

# Stop all services
function Stop {
    Write-Header "Stopping ClinicalGoTo Services"
    
    docker-compose down
    Write-Status "All services stopped"
}

# Clean up containers and images
function Clean {
    Write-Header "Cleaning Up Docker Resources"
    
    Write-Status "Stopping and removing containers..."
    docker-compose down -v --remove-orphans
    
    Write-Status "Removing unused images..."
    docker image prune -f
    
    Write-Status "Cleanup completed"
}

# View logs
function Logs {
    Write-Header "Viewing Application Logs"
    
    if ($Parameter) {
        docker-compose logs -f $Parameter
    } else {
        docker-compose logs -f clinicalgoto
    }
}

# Show status of services
function Status {
    Write-Header "Service Status"
    
    docker-compose ps
    
    Write-Status "`nContainer health status:"
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
}

# Execute shell in container
function Shell {
    Write-Header "Opening Shell in ClinicalGoTo Container"
    
    docker-compose exec clinicalgoto /bin/sh
}

# Run tests
function Test {
    Write-Header "Running Tests"
    
    docker-compose exec clinicalgoto npm test
}

# Backup data
function Backup {
    Write-Header "Creating Backup"
    
    $BackupDir = "backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup database if running
    $postgresStatus = docker-compose ps postgres
    if ($postgresStatus -match "Up") {
        Write-Status "Backing up PostgreSQL database..."
        docker-compose exec postgres pg_dump -U clinicalgoto clinicalgoto | Out-File -FilePath "$BackupDir\database.sql" -Encoding UTF8
    }
    
    # Backup Redis data if running
    $redisStatus = docker-compose ps redis
    if ($redisStatus -match "Up") {
        Write-Status "Backing up Redis data..."
        docker-compose exec redis redis-cli BGSAVE
        $redisContainer = docker-compose ps -q redis
        docker cp "${redisContainer}:/data/dump.rdb" "$BackupDir\"
    }
    
    Write-Status "Backup created in $BackupDir"
}

# Restore from backup
function Restore {
    if (-not $Parameter) {
        Write-Error "Please provide backup directory path"
        Write-Status "Usage: .\docker-scripts.ps1 restore <backup_directory>"
        return
    }
    
    Write-Header "Restoring from Backup: $Parameter"
    
    if (Test-Path "$Parameter\database.sql") {
        Write-Status "Restoring PostgreSQL database..."
        Get-Content "$Parameter\database.sql" | docker-compose exec -T postgres psql -U clinicalgoto clinicalgoto
    }
    
    if (Test-Path "$Parameter\dump.rdb") {
        Write-Status "Restoring Redis data..."
        docker-compose stop redis
        $redisContainer = docker-compose ps -q redis
        docker cp "$Parameter\dump.rdb" "${redisContainer}:/data/"
        docker-compose start redis
    }
    
    Write-Status "Restore completed"
}

# Show help
function Help {
    Write-Header "ClinicalGoTo Docker Management Commands"
    
    Write-Host "Usage: .\docker-scripts.ps1 <command> [parameter]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  build       Build the Docker image"
    Write-Host "  dev         Start in development mode with hot reloading"
    Write-Host "  prod        Start in production mode"
    Write-Host "  prod-nginx  Start with Nginx reverse proxy"
    Write-Host "  with-db     Start with PostgreSQL database"
    Write-Host "  stop        Stop all services"
    Write-Host "  clean       Clean up containers and images"
    Write-Host "  logs [svc]  View logs (optionally for specific service)"
    Write-Host "  status      Show service status"
    Write-Host "  shell       Open shell in main container"
    Write-Host "  test        Run tests"
    Write-Host "  backup      Create backup of data"
    Write-Host "  restore     Restore from backup"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-scripts.ps1 dev                  # Start development environment"
    Write-Host "  .\docker-scripts.ps1 prod                 # Start production environment"
    Write-Host "  .\docker-scripts.ps1 logs                 # View application logs"
    Write-Host "  .\docker-scripts.ps1 logs postgres        # View database logs"
    Write-Host "  .\docker-scripts.ps1 backup               # Create backup"
    Write-Host "  .\docker-scripts.ps1 restore backups\20231210_143022  # Restore from backup"
}

# Main command handler
switch ($Command) {
    "build"      { Build }
    "dev"        { Dev }
    "prod"       { Prod }
    "prod-nginx" { Prod-Nginx }
    "with-db"    { With-Db }
    "stop"       { Stop }
    "clean"      { Clean }
    "logs"       { Logs }
    "status"     { Status }
    "shell"      { Shell }
    "test"       { Test }
    "backup"     { Backup }
    "restore"    { Restore }
    "help"       { Help }
    default      { Help }
}
