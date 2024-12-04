# Connecting to the Medusa Database

To connect to the Medusa database using `psql`, follow these steps:

1. **Open your terminal.**

2. **Run the following command:**

   ```sh
   psql -h db -U postgres -d medusa-app
   ```

   - `-h db`: Specifies the host name of the database server.
   - `-U postgres`: Specifies the username to connect as.
   - `-d medusa-app`: Specifies the name of the database to connect to.

3. **Enter the password** for the `postgres` user when prompted.

You should now be connected to the `medusa-app` database and can start executing SQL commands.

For more information on `psql` and its options, refer to the [PostgreSQL documentation](https://www.postgresql.org/docs/current/app-psql.html).
