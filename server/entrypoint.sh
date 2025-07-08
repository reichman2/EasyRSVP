#!/bin/sh

# Wait until Postgres is ready
until nc -z db 5432; do
  echo "Waiting for Postgres at db:5432..."
  sleep 1
done

# Run Prisma migrations
npx prisma migrate deploy

# Start the server
npm start