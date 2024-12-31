#!/usr/bin/env bash

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 9000; do
  >&2 echo "Medusa app is unavailable - sleeping"
  sleep 1
done

>&2 echo "Medusa app is up - executing command"
exec $cmd