#!/bin/sh

# configure via env vars
export PORT=8080
export CORS_ORIGIN=http://localhost:8080

# run via nodejs
cd dist
node server.js
