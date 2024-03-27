# Tailor

Work in progress. Not ready for production.

## Setup

- Use node version from `.nvmrc` - `nvm use`
- Install dependencies `npm install`

## Development server

- Start a simple development - `npm start`
- Open http://localhost:8000/

## Extension

### Firefox

Project uses [web-ext](https://github.com/mozilla/web-ext) for Firefox extension development.

- Start extension in development mode - `npm run firefox:run`
- Build Firefox extension in development mode - `npm run firefox:run`

### Chrome

Work in progress. For now you can copy `manifest-chrome.json` to `manifest.json` and load unpacked extension.

## TODO

- [ ] Info panel improvements
- [ ] When parent is scrolled calculated position is wrong, probably need to subtract the scroll position
- [ ] Handle touch events when simulating phones/tablets in devtools
