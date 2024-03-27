#!/bin/bash

# Clean
rm -rf ./dist

# Build
./node_modules/.bin/esbuild ./src/index.ts --minify --sourcemap --outdir=dist

# Copy CSS to the dist folder
cp ./docs/css/tailor.css ./dist/
