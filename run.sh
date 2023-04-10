#!/bin/sh

# fail build script when any command fails and kill background processes on script failure
set -e
#trap 'sleep 5 && echo "Killing PIDs $(jobs -p)" && kill $(jobs -p)' ERR

# configure application
export NODE_ENV=production
export SP_HOSTNAME=127.0.0.1
export SP_PORT=4201
export SP_CORS_ORIGIN=https://sp.rv-sys.de
export SP_LOG_LEVEL=2

# change to dist folder relative to script location
DIR="$(cd "$(dirname "$0")" && pwd)"
cd $DIR/dist

# run via nodejs
echo "Starting application on $(date)"

runApplication()
{
    node --max-old-space-size=128 bundle.js &
    APP_PID=$!
}

runApplication

# listen for file changes of special file and restart application if modified
LAST_MODIFIED=$(stat restart-on-modified.txt | grep Modify)

while true; do
    sleep 120
    NEW_LAST_MODIFIED=$(stat restart-on-modified.txt | grep Modify)
    if [ "$NEW_LAST_MODIFIED" != "$LAST_MODIFIED" ]
    then
        # restart application
        echo "Restarting application on $(date)"
        
        if [ ! -z "$APP_PID" ]
        then
            # kill previous instance
            kill $APP_PID
            sleep 2
        fi
        
        runApplication

        LAST_MODIFIED=$NEW_LAST_MODIFIED
    fi
done
