#!/bin/bash

echo "npm install package"
npm install

echo "npm build the project"
npm run build

echo "Starting the server"
npm run start