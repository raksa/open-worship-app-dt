#!/bin/bash
set -x

current_script_dir=$(dirname "$0")
cd "$current_script_dir"
pwd

is_release=false
if [ "$1" == "--release" ]; then
    is_release=true
    echo "Release build mode enabled."
else
    echo "Debug build mode enabled."
fi
if [ "$is_release" = true ]; then
    dotnet build -c Release
else
    dotnet build -c Debug
fi
if [ $? -ne 0 ]; then
    echo "Build failed. Please check the output for errors."
    exit 1
fi

dist_dir="./dist"
rm -rf $dist_dir
mkdir -p $dist_dir
if [ "$is_release" = true ]; then
    cp ./bin/Release/net8.0/ $dist_dir -r
else
    cp ./bin/Debug/net8.0/ $dist_dir -r
fi
if [ $? -ne 0 ]; then
    echo "Failed to copy build output to distribution directory."
    exit 1
fi
echo "Build and copy completed successfully."
