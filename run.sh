#!/bin/bash

# Professional script to manage Docker-based development and production environments
# for training-project-back-end application

set -e  # Exit on error

# Signal handler to prevent accidental container shutdown
cleanup_on_exit() {
  # Only show message, don't stop containers
  if [ "$1" = "SIGINT" ]; then
    echo ""
    echo "Script interrupted. Note: Containers continue running in background."
    echo "Use './run.sh prod:app:stop' or './run.sh status' to manage them."
    exit 0
  fi
}

# Set up signal traps
trap 'cleanup_on_exit SIGINT' INT
trap 'cleanup_on_exit SIGTERM' TERM

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Environment variables files
DEV_ENV_FILE=".env.development"
PROD_ENV_FILE=".env.production"

# Application name
APP_NAME="LMS Application"

# Docker related variables
DEV_COMPOSE_FILE="docker-compose.dev.yml"
PROD_COMPOSE_FILE="docker-compose.yml"
DEV_DB_CONTAINER="lms_postgres_dev"
PROD_DB_CONTAINER="lms_postgres"
APP_CONTAINER="lms_app"

# Log function for consistent output
log() {
  local level=$1
  local message=$2
  local color=$NC
  
  case "$level" in
    "INFO") color=$GREEN ;;
    "WARN") color=$YELLOW ;;
    "ERROR") color=$RED ;;
    "DEBUG") color=$BLUE ;;
  esac
  
  echo -e "[${color}${level}${NC}] ${message}"
}

# Print script banner
print_banner() {
  local current_date=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "\n${BOLD}=============================================${NC}"
  echo -e "${BOLD}  ${APP_NAME} Environment Manager${NC}"
  echo -e "${BOLD}  ${current_date}${NC}"
  echo -e "${BOLD}=============================================${NC}\n"
}

# Print usage information
print_usage() {
  echo -e "${BOLD}Commands:${NC}"
  echo -e "  ${GREEN}dev:db:start${NC}        Start development database"
  echo -e "  ${GREEN}dev:db:stop${NC}         Stop development database"
  echo -e "  ${GREEN}dev:app${NC}             Start app in development mode ${YELLOW}(persistent background)${NC}"
  echo -e "  ${GREEN}dev:app:logs${NC}        View development app logs"
  echo -e "  ${GREEN}prod:app${NC}            Start app in production mode ${YELLOW}(persistent background)${NC}"
  echo -e "  ${GREEN}prod:app:logs${NC}       View production app logs"
  echo -e "  ${GREEN}prod:app:stop${NC}       Stop production app"
  echo -e "  ${GREEN}migrations:run${NC}      Run database migrations (dev environment) ${YELLOW}[DEPRECATED - use dev:app]${NC}"
  echo -e "  ${GREEN}migrations:run:prod${NC} Run database migrations (prod environment) ${YELLOW}[DEPRECATED - use prod:app]${NC}"
  echo -e "  ${GREEN}status${NC}              Show status of all containers"
  echo -e "  ${GREEN}help${NC}                Show this help message"
  echo ""
  echo -e "${YELLOW}Note: Apps run in persistent background mode. Ctrl+C won't stop containers.${NC}"
  echo -e "${YELLOW}Use the stop commands or 'docker compose down' to stop services.${NC}"
}

# Check if Docker and Docker Compose are available
check_docker() {
  log "INFO" "Checking Docker installation..."
  
  if ! command -v docker &> /dev/null; then
    log "ERROR" "Docker is not installed or not in PATH. Please install Docker first."
    exit 1
  fi

  if ! docker info &> /dev/null; then
    log "ERROR" "Docker daemon is not running. Please start Docker first."
    exit 1
  fi

  # Check for docker compose
  if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    log "ERROR" "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
  fi
  
  log "INFO" "Docker environment verified ✓"
}

# Docker compose wrapper to handle both docker-compose and docker compose
docker_compose() {
  local compose_file=$1
  shift
  
  if docker compose version &> /dev/null; then
    docker compose -f "$compose_file" "$@"
  else
    docker-compose -f "$compose_file" "$@"
  fi
}

# Start development database
start_dev_db() {
  check_docker
  log "INFO" "Starting development database..."
  docker_compose "$DEV_COMPOSE_FILE" up -d
  
  # Wait for database to be ready
  log "INFO" "Waiting for database to be ready..."
  local max_attempts=10
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if docker exec "$DEV_DB_CONTAINER" pg_isready -U postgres &> /dev/null; then
      log "INFO" "Development database is running and ready!"
      echo -e "${BOLD}Connection details:${NC}"
      echo "  Host: localhost"
      echo "  Port: 5432"
      echo "  User: postgres"
      echo "  Password: postgres"
      echo "  Database: lms_db_dev"
      return 0
    fi
    
    log "DEBUG" "Attempt $attempt/$max_attempts - Database not ready yet, waiting..."
    sleep 2
    ((attempt++))
  done
  
  log "ERROR" "Database did not start properly within the expected time. Check logs:"
  echo "  docker logs $DEV_DB_CONTAINER"
  return 1
}

# Stop development database
stop_dev_db() {
  check_docker
  log "INFO" "Stopping development database..."
  docker_compose "$DEV_COMPOSE_FILE" down
  log "INFO" "Development database stopped."
}

# Run the app in development mode using Docker
run_dev_app() {
  check_docker
  log "INFO" "Starting application in development mode..."
  
  # Create a custom docker-compose file for development
  local TMP_DEV_COMPOSE="docker-compose.dev.app.yml"
  
  # Copy the existing docker-compose.yml and modify it for development
  cat > "$TMP_DEV_COMPOSE" << EOF
version: '3.8'

services:
  app_dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lms_app_dev
    restart: unless-stopped
    ports:
      - '3333:3333'
    env_file:
      - $DEV_ENV_FILE
    environment:
      - NODE_ENV=development
    volumes:
      - ./:/app
      - /app/node_modules
    command: npm run start:dev
    networks:
      - lms_network

networks:
  lms_network:
    driver: bridge
EOF
  
  log "INFO" "Running app in development mode (background) with Docker..."
  docker_compose "$TMP_DEV_COMPOSE" up -d
  
  # Give containers a moment to start
  sleep 2
  
  if docker ps --filter "name=lms_app_dev" --filter "status=running" | grep -q lms_app_dev; then
    log "INFO" "✅ Development app started successfully in background!"
    log "INFO" "Container is running independently."
    echo ""
    log "INFO" "Useful commands:"
    log "INFO" "  View logs: ${BOLD}$0 dev:app:logs${NC}"
    log "INFO" "  Check status: ${BOLD}$0 status${NC}"
    echo ""
    log "INFO" "App is running on: ${BOLD}http://localhost:3333${NC}"
    log "INFO" "Script completed. Container continues running in background."
  else
    log "WARN" "Container may be starting up. Check status with: $0 status"
  fi
  
  # Cleanup the temporary file
  rm "$TMP_DEV_COMPOSE"
}

# Show development app logs
show_dev_app_logs() {
  check_docker
  log "INFO" "Showing development app logs..."
  docker logs -f lms_app_dev
}

# Run the app in production mode using Docker
run_prod_app() {
  check_docker
  log "INFO" "Starting application in production mode (background)..."
  
  # Check if production env file exists
  if [ ! -f "$PROD_ENV_FILE" ]; then
    log "ERROR" "$PROD_ENV_FILE not found. Cannot start in production mode."
    exit 1
  fi
  
  # Run production stack in detached mode
  docker_compose "$PROD_COMPOSE_FILE" up -d
  
  # Give containers a moment to start
  sleep 2
  
  # Quick verification without keeping the script running
  if docker_compose "$PROD_COMPOSE_FILE" ps --services --filter "status=running" | wc -l | grep -q "^[1-9]"; then
    log "INFO" "✅ Production app started successfully in background!"
    log "INFO" "Containers are running independently."
    echo ""
    log "INFO" "Useful commands:"
    log "INFO" "  View logs: ${BOLD}$0 prod:app:logs${NC}"
    log "INFO" "  Stop app: ${BOLD}$0 prod:app:stop${NC}"
    log "INFO" "  Check status: ${BOLD}$0 status${NC}"
    echo ""
    log "INFO" "App is running on: ${BOLD}http://localhost:9014${NC}"
    log "INFO" "Script completed. Containers continue running in background."
  else
    log "WARN" "Containers may be starting up. Check status with: $0 status"
  fi
  
  # Script exits here, containers keep running
}

# Show production app logs
show_prod_app_logs() {
  check_docker
  log "INFO" "Showing production app logs..."
  docker logs -f "$APP_CONTAINER"
}

# Stop production app
stop_prod_app() {
  check_docker
  log "INFO" "Stopping production app..."
  docker_compose "$PROD_COMPOSE_FILE" down
  log "INFO" "Production app stopped."
}

# Run database migrations
run_migrations() {
  check_docker
  local env_type=$1
  local env_file
  local container_name
  local compose_file
  
  if [ "$env_type" == "prod" ]; then
    env_file=$PROD_ENV_FILE
    container_name=$APP_CONTAINER
    compose_file=$PROD_COMPOSE_FILE
    log "INFO" "Running migrations in PRODUCTION environment..."
    
    # Check if production env file exists
    if [ ! -f "$env_file" ]; then
      log "ERROR" "$env_file not found. Cannot run migrations in production mode."
      exit 1
    fi
  else
    env_file=$DEV_ENV_FILE
    container_name="lms_app_dev"
    compose_file="docker-compose.dev.app.yml"
    log "INFO" "Running migrations in DEVELOPMENT environment..."
  fi

  # Create a temporary docker-compose file for migrations
  local TMP_MIGRATIONS_COMPOSE="docker-compose.migrations.yml"
  
  # Determine the appropriate database service and network configuration
  if [ "$env_type" == "prod" ]; then
    postgres_service="postgres"
    postgres_container="lms_postgres"
    network_name="training-project-back-end_default"
  else
    postgres_service="postgres_dev"
    postgres_container="lms_postgres_dev"
    network_name="training-project-back-end_default"
  fi
  
  cat > "$TMP_MIGRATIONS_COMPOSE" << EOF
services:
  $postgres_service:
    image: postgres:15-alpine
    container_name: $postgres_container
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: $([ "$env_type" == "prod" ] && echo "lms_db" || echo "lms_db_dev")
    ports:
      - '$([ "$env_type" == "prod" ] && echo "9013" || echo "9015"):5432'
    volumes:
      - $([ "$env_type" == "prod" ] && echo "postgres_data" || echo "postgres_dev_data"):/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - lms_network

  migrations:
    build: .
    container_name: lms_migrations
    env_file:
      - $env_file
    environment:
      - NODE_ENV=$([ "$env_type" == "prod" ] && echo "production" || echo "development")
    command: npm run migration:run
    depends_on:
      $postgres_service:
        condition: service_healthy
    networks:
      - lms_network

networks:
  lms_network:
    driver: bridge

volumes:
  $([ "$env_type" == "prod" ] && echo "postgres_data" || echo "postgres_dev_data"):
EOF

  log "INFO" "Running migrations in Docker..."
  docker_compose "$TMP_MIGRATIONS_COMPOSE" up --build
  
  # Check migration status
  local exit_code=$?
  if [ $exit_code -eq 0 ]; then
    log "INFO" "Migrations completed successfully."
  else
    log "ERROR" "Migration failed with exit code $exit_code."
  fi
  
  # Cleanup
  docker_compose "$TMP_MIGRATIONS_COMPOSE" down
  rm "$TMP_MIGRATIONS_COMPOSE"
  
  return $exit_code
}

# Show status of all containers
show_status() {
  check_docker
  log "INFO" "Current containers status:"
  echo
  echo -e "${BOLD}Development Database:${NC}"
  if docker ps -q --filter "name=$DEV_DB_CONTAINER" | grep -q .; then
    echo -e "  Status: ${GREEN}Running${NC}"
    echo -e "  Container: $DEV_DB_CONTAINER"
    echo -e "  Port: 5432"
  else
    echo -e "  Status: ${RED}Stopped${NC}"
  fi
  
  echo
  echo -e "${BOLD}Development App:${NC}"
  if docker ps -q --filter "name=lms_app_dev" | grep -q .; then
    echo -e "  Status: ${GREEN}Running${NC}"
    echo -e "  Container: lms_app_dev"
    echo -e "  Port: 3333"
  else
    echo -e "  Status: ${RED}Stopped${NC}"
  fi
  
  echo
  echo -e "${BOLD}Production App:${NC}"
  if docker ps -q --filter "name=$APP_CONTAINER" | grep -q .; then
    echo -e "  Status: ${GREEN}Running${NC}"
    echo -e "  Container: $APP_CONTAINER"
    echo -e "  Port: 3333"
  else
    echo -e "  Status: ${RED}Stopped${NC}"
  fi
  
  echo
  echo -e "${BOLD}Production Database:${NC}"
  if docker ps -q --filter "name=$PROD_DB_CONTAINER" | grep -q .; then
    echo -e "  Status: ${GREEN}Running${NC}"
    echo -e "  Container: $PROD_DB_CONTAINER"
    echo -e "  Port: 5433"
  else
    echo -e "  Status: ${RED}Stopped${NC}"
  fi
}

# Main execution
print_banner

case "$1" in
  "dev:db:start")
    start_dev_db
    ;;
  "dev:db:stop")
    stop_dev_db
    ;;
  "dev:app")
    run_dev_app
    ;;
  "dev:app:logs")
    show_dev_app_logs
    ;;
  "prod:app")
    run_prod_app
    ;;
  "prod:app:logs")
    show_prod_app_logs
    ;;
  "prod:app:stop")
    stop_prod_app
    ;;
  "migrations:run")
    run_migrations "dev"
    ;;
  "migrations:run:prod")
    run_migrations "prod"
    ;;
  "status")
    show_status
    ;;
  "help"|"-h"|"--help")
    print_usage
    ;;
  "")
    log "ERROR" "No command specified"
    print_usage
    exit 1
    ;;
  *)
    log "ERROR" "Unknown command: $1"
    print_usage
    exit 1
    ;;
esac