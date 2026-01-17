#!/bin/bash

# Exit on error
set -e

# Change to the app directory
cd /app

# Always install dependencies since we're mounting the source code
echo "Installing dependencies..."
npm install

# Generate the Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate self-signed certificate if not already present
if [ ! -f ssl/backend.key ] || [ ! -f ssl/backend.crt ]; then
  echo "Generating self-signed SSL certificate..."
  openssl req -x509 -newkey rsa:2048 \
    -keyout ssl/backend.key \
    -out ssl/backend.crt \
    -days 365 -nodes \
    -subj "/C=NP/ST=Bagmati/L=Kathmandu/O=CivilFlow/OU=Dev/CN=localhost"
fi

# Start the server in development mode
echo "Starting NestJS server..."
npx nest start --watch
