#!/bin/bash

# Build the frontend
cd frontend
npm ci
npm run build
cd ..

# Create the deployment package
echo "Build completed successfully!" 