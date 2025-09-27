#!/bin/bash

# Script to manage the development and production environments
# for training-project-back-end application

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Environment variables files
DEV_ENV_FILE=".env.development"
PROD_ENV_FILE=".env.production"

print_usage() {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  $0 ${GREEN}dev:db:start${NC}    - Start development database"
  echo -e "  $0 ${GREEN}dev:db:stop${NC}     - Stop development database"
  echo -e "  $0 ${GREEN}dev:app${NC}         - Run app with development configuration"
  echo -e "  $0 ${GREEN}prod:app${NC}        - Run app with production configuration"
  echo -e "  $0 ${GREEN}migrations:run${NC}  - Run database migrations"
  echo -e "  $0 ${GREEN}help${NC}            - Show this help message"
}

check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed or not in PATH. Please install Docker first.${NC}"
    exit 1
  fi

  if ! docker info &> /dev/null; then
    echo -e "${RED}Docker daemon is not running. Please start Docker first.${NC}"
    exit 1
  fi
}

start_dev_db() {
  check_docker
  echo -e "${YELLOW}Starting development database...${NC}"
  docker-compose -f docker-compose.dev.yml up -d
  
  # Wait for database to be ready
  echo -e "${YELLOW}Waiting for database to be ready...${NC}"
  sleep 5
  if docker exec lms_postgres_dev pg_isready -U postgres &> /dev/null; then
    echo -e "${GREEN}Development database is running and ready!${NC}"
    echo -e "${YELLOW}Connection details:${NC}"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  User: postgres"
    echo "  Password: postgres"
    echo "  Database: lms_db_dev"
  else
    echo -e "${RED}Database did not start properly. Check docker logs for details:${NC}"
    echo -e "  docker logs lms_postgres_dev"
  fi
}

stop_dev_db() {
  check_docker
  echo -e "${YELLOW}Stopping development database...${NC}"
  docker-compose -f docker-compose.dev.yml down
  echo -e "${GREEN}Development database stopped.${NC}"
}

run_dev_app() {
  echo -e "${YELLOW}Starting application in development mode...${NC}"
  if [ -f "$DEV_ENV_FILE" ]; then
    echo -e "${GREEN}Using development environment file: $DEV_ENV_FILE${NC}"
    export $(grep -v '^#' $DEV_ENV_FILE | xargs)
  else
    echo -e "${YELLOW}Warning: $DEV_ENV_FILE not found. Using default environment variables.${NC}"
  fi
  
  npm run start:dev
}

run_prod_app() {
  echo -e "${YELLOW}Starting application in production mode...${NC}"
  if [ -f "$PROD_ENV_FILE" ]; then
    echo -e "${GREEN}Using production environment file: $PROD_ENV_FILE${NC}"
    export $(grep -v '^#' $PROD_ENV_FILE | xargs)
  else
    echo -e "${RED}Error: $PROD_ENV_FILE not found. Cannot start in production mode.${NC}"
    exit 1
  fi
  
  npm run build
  npm run start:prod
}

run_migrations() {
  echo -e "${YELLOW}Running database migrations...${NC}"
  if [ "$1" == "prod" ]; then
    if [ -f "$PROD_ENV_FILE" ]; then
      echo -e "${GREEN}Using production environment file: $PROD_ENV_FILE${NC}"
      export $(grep -v '^#' $PROD_ENV_FILE | xargs)
    else
      echo -e "${RED}Error: $PROD_ENV_FILE not found. Cannot run migrations in production mode.${NC}"
      exit 1
    fi
  else
    if [ -f "$DEV_ENV_FILE" ]; then
      echo -e "${GREEN}Using development environment file: $DEV_ENV_FILE${NC}"
      export $(grep -v '^#' $DEV_ENV_FILE | xargs)
    else
      echo -e "${YELLOW}Warning: $DEV_ENV_FILE not found. Using default environment variables.${NC}"
    fi
  fi
  
  npm run migration:run
}

# Main command handling
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
  "prod:app")
    run_prod_app
    ;;
  "migrations:run")
    if [ "$2" == "prod" ]; then
      run_migrations "prod"
    else
      run_migrations "dev"
    fi
    ;;
  "help"|"-h"|"--help")
    print_usage
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    print_usage
    exit 1
    ;;
esac