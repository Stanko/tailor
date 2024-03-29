#!/bin/bash

# Clean up the build
rm -rf ./extension/build/*

# Copy Chrome manifest in place
cp ./extension/manifest-chrome.json ./extension/manifest.json

# Copy Tailor CSS
cp ./docs/css/tailor.css ./extension/css/

# Build the extension scripts
./node_modules/.bin/esbuild ./src/extension/*.ts --bundle --minify --sourcemap --outdir=extension/build

# Bundle the extension
zip -r ./web-ext-artifacts/tailor-chrome.zip ./extension/manifest.json ./extension/build/ ./extension/icons/ ./extension/css/ ./extension/templates/
