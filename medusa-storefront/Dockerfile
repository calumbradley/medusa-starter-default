# Use Node 20 as the base image
FROM node:20

# Install netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chmod +x ./scripts/wait-for-app.sh

# Expose the port the app runs on
EXPOSE 8000