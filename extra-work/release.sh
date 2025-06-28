#!/bin/bash
set -x

current_script_dir=$(dirname "$0")
cd "$current_script_dir/.."

rm -rf ./release
tmp_dir=$(realpath ./extra-work/tmp)
rm -rf $tmp_dir
mkdir $tmp_dir
bin_file_info="files.txt"
sep="|"

win_prep() {
    mv ./release $1
    target_file="$1/$bin_file_info"
    ls "$1" | grep -E '\.exe$|\.zip$' | while read -r file; do
        file_name=$(basename "$file")
        checksum=$(sha512sum "$1/$file" | awk '{print $1}')
        version=$(grep 'version:' "$1/latest.yml" | awk '{print $2}' | tr -d "'")
        release_date=$(grep 'releaseDate:' "$1/latest.yml" | awk '{print $2}' | tr -d "'")
        echo "${file_name}${sep}${checksum}${sep}${release_date}${sep}${version}" >> "$target_file"
    done
}

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    npm run pack:win:32
    win_prep ./extra-work/tmp/win-ia32
    npm run pack:win
    win_prep ./extra-work/tmp/win
elif [[ "$OSTYPE" == "darwin"* ]]; then
    npm run pack:all
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    npm run pack:all
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

if [[ -f ./extra-work/.env ]]; then
    source ./extra-work/.env
else
    echo "Error: .env file not found."
    exit 1
fi

export RELEASE_AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export RELEASE_AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export RELEASE_AWS_REGION="${AWS_REGION}"
export RELEASE_AWS_BUCKET_NAME="${AWS_BUCKET_NAME}"
export RELEASE_STORAGE_DIR="$tmp_dir"
export RELEASE_BIN_FILE_SEPARATOR="$sep"
export RELEASE_BIN_FILE_INFO="$bin_file_info"
node ./extra-work/s3-push-release.js
