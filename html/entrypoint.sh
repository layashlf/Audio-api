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

# Run migrations
npx prisma migrate deploy

# Seed MeiliSearch indexes (Idempotent)
node seed-meilisearch.js


# Start the server in development mode
echo "Starting NestJS server..."
npx nest start --watch
