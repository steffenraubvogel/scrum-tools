#!/bin/sh

# fail build script when any command fails
set -e

# clean up previous builds
echo "Cleaning up previous builds"
rm -rf dist
rm -rf scrum-tools-ui/dist
rm -rf scrum-tools-server/dist

# build frontend
echo "Building frontend"
cd scrum-tools-ui

if [ -d "node_modules" ]; then
   echo "Skipping npm i"
else
   npm i
fi

npm run build

# build backend
echo "Building backend"
cd ../scrum-tools-server

if [ -d "node_modules" ]; then
   echo "Skipping npm i"
else
   npm i
fi

npm run build
npm run bundle

# merge the build output
cd ..
mkdir -p dist/public
mv scrum-tools-ui/dist/scrum-tools-ui/browser/* dist/public
mv scrum-tools-server/dist/bundle.js dist
touch dist/restart-on-modified.txt