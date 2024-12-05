#!/bin/bash

host="$1"
shift
cmd1="$1"
shift
cmd2="$@"

until pg_isready -h "$host" -p 5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing cmd1"
$cmd1

>&2 echo "Running npm run dev"
$cmd2