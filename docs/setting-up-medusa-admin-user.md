### Documentation: Setting Up the Medusa Admin User

When the Medusa application is spun up using Docker Compose, you need to manually create an admin user. Follow the steps below to access the Docker app container and run the necessary command to create the admin user.

#### Prerequisites

Ensure that you have Docker and Docker Compose installed on your system.

#### Step-by-Step Instructions

1. **Start the Medusa Application**

   Use Docker Compose to start the Medusa application. Run the following command in your project directory:

   ```sh
   sudo docker compose up -d
   ```

   This command will start all the services defined in your

docker-compose.yml

file.

2. **Access the Medusa App Container**

   Once the services are up and running, you need to access the Medusa app container. Run the following command to open a shell inside the container:

   ```sh
   sudo docker exec -it medusa-app sh
   ```

   This command will give you access to the shell inside the Medusa app container.

3. **Create the Admin User**

   Inside the container, run the following command to create an admin user:

   ```sh
   npx medusa user -e "<your-admin-email>" -p "<your-admin-password>" -i '<your-admin-id>'
   ```

   Replace `<your-admin-email>`, `<your-admin-password>`, and `<your-admin-id>` with your desired admin email, password, and ID.

#### Summary

By following these steps, you can start the Medusa application using Docker Compose, access the Medusa app container, and run the necessary command to create an admin user. Ensure that the required environment variables are set in the

.env

file inside the container. This will allow you to create an admin user and access your Medusa application with administrative privileges.
