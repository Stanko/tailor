#!/bin/bash

# Clean up the build
rm -rf ./extension/build/*

# Copy Firefox manifest in place
cp ./extension/manifest-ff.json ./extension/manifest.json

# Copy Tailor CSS
cp ./docs/css/tailor.css ./extension/css/

# Build the extension scripts
./node_modules/.bin/esbuild ./src/extension/*.ts --bundle --minify --sourcemap --outdir=extension/build

# Bundle the extension
./node_modules/.bin/web-ext build -s ./extension --overwrite-dest
