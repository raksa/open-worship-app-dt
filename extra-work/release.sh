#!/bin/bash
set -x

current_script_dir=$(dirname "$0")
cd "$current_script_dir/.."

rm -rf release
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    npm run pack:win && npm run pack:win:32
elif [[ "$OSTYPE" == "darwin"* ]]; then
    npm run pack:all
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    npm run pack:all
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

node ./extra-work/s3-push.mjs
