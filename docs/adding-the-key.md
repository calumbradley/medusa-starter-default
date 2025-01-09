# Adding the MEDUSA_PUBLISHABLE_KEY to the docker storefront env

Start the container with an overridden entrypoint to prevent it from running the default commands specified in the Dockerfile:

```bash
docker compose run --rm --entrypoint sh medusa-storefront-app
```

```bash
echo "<your-env-value>=<your-value>" > .env
```
