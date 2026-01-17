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

# Function to generate SSL certificates
generate_ssl_certificates() {
  local ssl_dir="./html/ssl"
  local key_file="$ssl_dir/localhost-key.pem"
  local cert_file="$ssl_dir/localhost.pem"

  # Check if certificates already exist
  if [[ -f "$key_file" && -f "$cert_file" ]]; then
    echo "SSL certificates already exist at $ssl_dir"
    return 0
  fi

  echo "Generating self-signed SSL certificates for localhost..."

  # Create ssl directory if it doesn't exist
  mkdir -p "$ssl_dir"

  # Generate private key
  openssl genrsa -out "$key_file" 2048

  # Generate certificate signing request
  openssl req -new -key "$key_file" -out "$ssl_dir/localhost.csr" \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

  # Generate self-signed certificate
  openssl x509 -req -days 365 -in "$ssl_dir/localhost.csr" -signkey "$key_file" -out "$cert_file"

  # Clean up CSR file
  rm -f "$ssl_dir/localhost.csr"

  echo "SSL certificates generated successfully!"
  echo "Files created:"
  echo "  - $key_file (private key)"
  echo "  - $cert_file (certificate)"
}

# Function to stop and prune Docker containers
stop_docker() {
  echo "Stopping Docker containers..."
  ${COMPOSE_CMD} down


}

start_docker() {
  # Generate SSL certificates if needed
  generate_ssl_certificates

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
