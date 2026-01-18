#!/bin/bash

# Enable strict error handling
set -e

# Check if the .env file exists
APP_ENV_FILE="./html/.env"
if [[ ! -f "${APP_ENV_FILE}" ]]; then
  echo "Error: The environment file not found at ${APP_ENV_FILE}"
  exit 1
fi

# Set current user IDs in the environment
USER_UID=$(id -u)
USER_GID=$(id -g)
export USER_UID USER_GID

# Docker Compose command wrapper
COMPOSE_CMD="docker compose --env-file $APP_ENV_FILE --file compose.yml"

# Function to stop and prune Docker containers
stop_docker() {
  echo "Stopping Docker containers..."
  ${COMPOSE_CMD} down

}

start_docker() {
  # Start services
  echo "Starting Docker containers..."
  ${COMPOSE_CMD} up
}

# Check if the argument is "stop"
if [[ "$1" == "stop" ]]; then
  # Stop services
  stop_docker
else
  start_docker
fi
