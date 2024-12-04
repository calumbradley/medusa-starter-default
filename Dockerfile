# Use the official Node.js image as the base image
FROM node:20

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 9000