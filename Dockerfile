# Use the official Node.js image as the base image
FROM node:22.14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./html/package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files
COPY ./html .

# Generate the prisma client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
