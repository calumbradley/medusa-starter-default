FROM node:lts

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Make the wait-for-db.sh script executable
RUN chmod +x ./scripts/wait-for-db.sh

# Expose the application port
EXPOSE 9000

# Command to run the application
CMD ["./scripts/wait-for-db.sh", "db", "npx medusa db:migrate", "npm run dev"]