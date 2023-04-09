#!/bin/sh

# fail build script when any command fails
set -e

# configure application
export NODE_ENV=production
export SP_HOSTNAME=127.0.0.1
export SP_PORT=4201
export SP_CORS_ORIGIN=https://sp.rv-sys.de
export SP_LOG_LEVEL=2

# run via nodejs
DIR="$(cd "$(dirname "$0")" && pwd)"
cd $DIR/dist

node --max-old-space-size=128 server.js
