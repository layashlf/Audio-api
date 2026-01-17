#!/bin/bash

# Check if the .env file exists
APP_ENV_FILE="./html/.env"
if [[ ! -f "${APP_ENV_FILE}" ]]; then
  echo "Error: .env file not found. Exiting..."
  exit 1
fi

# Set current user IDs in the environment
USER_UID=$(id -u)
USER_GID=$(id -g)
export USER_UID USER_GID

# Login to the app container
docker compose --env-file "${APP_ENV_FILE}" --file compose.yml exec --user node nest-api-server bash
