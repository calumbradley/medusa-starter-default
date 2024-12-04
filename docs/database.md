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

# SSL certificate error remediation

1. **Generate SSL Certificates**:

If you haven't already generated SSL certificates, you can do so using OpenSSL:

```sh
openssl req -new -x509 -days 365 -nodes -out server.crt -keyout server.key -subj "/CN=localhost"
chmod 600 server.key
```

2. **Copy the SSL Certificates to the Container**:

Copy the generated SSL certificates to the PostgreSQL container:

```sh
docker cp server.crt <container_id>:/var/lib/postgresql/server.crt
docker cp server.key <container_id>:/var/lib/postgresql/server.key
```

Replace `<container_id>` with the ID of your PostgreSQL container. You can find the container ID using:

```sh
docker ps
```

3. \*\*Edit the

postgresql.conf

File Locally\*\*:

Copy the

postgresql.conf

file from the container to your local machine:

```sh
docker cp <container_id>:/var/lib/postgresql/data/postgresql.conf ./postgresql.conf
```

Open the

postgresql.conf

file in VS Code and add the following lines to enable SSL:

```conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
```

4. \*\*Copy the Edited

postgresql.conf

File Back to the Container\*\*:

After editing the file, copy it back to the PostgreSQL container:

```sh
docker cp ./postgresql.conf <container_id>:/var/lib/postgresql/data/postgresql.conf
```

5. **Restart the PostgreSQL Server**:

Restart the PostgreSQL server to apply the changes:

```sh
docker-compose restart db
```

6. \*\*Update the `DATABASE_URL` in the

.env

File\*\*:

Ensure that the `DATABASE_URL` in the

.env

file includes `?sslmode=require` to enforce SSL connections:

```env
DATABASE_URL=postgres://postgres:medusa@db:5432/medusa-app?sslmode=require
```

7. **Access the `app` Container and Test the Connection**:

Access the `app` container and test the connection to the PostgreSQL server using the `psql` command:

```sh
docker-compose exec app sh
psql $DATABASE_URL
```

### Example Workflow

1. **Generate SSL Certificates**:

```sh
openssl req -new -x509 -days 365 -nodes -out server.crt -keyout server.key -subj "/CN=localhost"
chmod 600 server.key
```

2. **Copy the SSL Certificates to the Container**:

```sh
docker cp server.crt <container_id>:/var/lib/postgresql/server.crt
docker cp server.key <container_id>:/var/lib/postgresql/server.key
```

3. \*\*Edit the

postgresql.conf

File Locally\*\*:

```sh
docker cp <container_id>:/var/lib/postgresql/data/postgresql.conf ./postgresql.conf
code postgresql.conf
```

Add the following lines:

```conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
```

4. \*\*Copy the Edited

postgresql.conf

File Back to the Container\*\*:

```sh
docker cp ./postgresql.conf <container_id>:/var/lib/postgresql/data/postgresql.conf
```

5. **Restart the PostgreSQL Server**:

```sh
docker-compose restart db
```

6. \*\*Update the `DATABASE_URL` in the

.env

File\*\*:

```env
DATABASE_URL=postgres://postgres:medusa@db:5432/medusa-app?sslmode=require
```

7. **Access the `app` Container and Test the Connection**:

```sh
docker-compose exec app sh
psql $DATABASE_URL
```

### Summary

By following these steps, you can ensure that the SSL certificates are correctly placed in the `/var/lib/postgresql/` directory and referenced in the

postgresql.conf

file. This setup will allow you to configure PostgreSQL to use SSL and test the connection from the `app` container. If you encounter any issues, please provide more details about the error messages or problems you are facing.
