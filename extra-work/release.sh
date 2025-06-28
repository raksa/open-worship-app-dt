#!/bin/bash
set -x

current_script_dir=$(dirname "$0")
cd "$current_script_dir/.."

# rm -rf release
# if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
#     npm run pack:win && npm run pack:win:32
# elif [[ "$OSTYPE" == "darwin"* ]]; then
#     npm run pack:all
# elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
#     npm run pack:all
# else
#     echo "Unsupported OS: $OSTYPE"
#     exit 1
# fi

if [[ -f ./extra-work/.env ]]; then
    source ./extra-work/.env
else
    echo "Error: .env file not found."
    exit 1
fi

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export REGION
export BUCKET_NAME
node ./extra-work/s3-push.js
