FROM node:lts

# Install netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Make the wait-for-app.sh script executable
RUN chmod +x ./scripts/wait-for-app.sh

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT ["/bin/sh", "-c", "./scripts/wait-for-app.sh medusa-app -- npm run build && npm start"]
