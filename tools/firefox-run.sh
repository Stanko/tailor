#!/bin/bash

# Terminate both web-ext and esbuild processes on Ctrl+C

terminate() {
  pkill -SIGINT -P $$
  exit
}

trap terminate SIGINT

# Clean up the build
rm -rf ./extension/build/*

# Copy Firefox manifest in place
cp ./extension/manifest-ff.json ./extension/manifest.json

# Copy Tailor CSS
cp ./docs/css/tailor.css ./extension/css/

# Run the extension
./node_modules/.bin/web-ext run -s ./extension --devtools --verbose &
# Store the PID of command2
web_ext_pid=$!

# Build and watch the extension scripts
./node_modules/.bin/esbuild ./src/extension/*.ts --watch --bundle --sourcemap --outdir=extension/build
esbuild_pid=$!

wait
