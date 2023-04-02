#!/bin/sh

# fail build script when any command fails
set -e

# clean up previous builds
echo "Cleaning up previous builds"
rm -rf dist
rm -rf scrum-poker/dist
rm -rf scrum-poker-server/dist

# build frontend
echo "Building frontend"
cd scrum-poker

if [ -d "node_modules" ]; then
   echo "Skipping npm i"
else
   npm i
fi

npm run build

# build backend
echo "Building backend"
cd ../scrum-poker-server

if [ -d "node_modules" ]; then
   echo "Skipping npm i"
else
   npm i
fi

npm run build

# merge the build output
cd ..
mkdir -p dist/public
mv scrum-poker/dist/scrum-poker/* dist/public
mv scrum-poker-server/dist/* dist
cp -r scrum-poker-server/node_modules dist