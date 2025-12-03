#!/bin/bash

echo "Setting up MongoDB Docker container for SnipSafe..."

# Check if container already exists
if docker ps -a --format 'table {{.Names}}' | grep -q '^snipsafe-mongodb$'; then
    echo "MongoDB container already exists. Starting it..."
    docker start snipsafe-mongodb
else
    echo "Creating new MongoDB container..."
    docker run -d \
      --name snipsafe-mongodb \
      -p 27017:27017 \
      -e MONGO_INITDB_ROOT_USERNAME=admin \
      -e MONGO_INITDB_ROOT_PASSWORD=password123 \
      -e MONGO_INITDB_DATABASE=snipsafe \
      -v snipsafe_data:/data/db \
      mongo:7.0
fi

echo "MongoDB is running on localhost:27017"
echo "Username: admin"
echo "Password: password123"
echo "Database: snipsafe"
echo ""
echo "To stop: docker stop snipsafe-mongodb"
echo "To remove: docker rm snipsafe-mongodb"
