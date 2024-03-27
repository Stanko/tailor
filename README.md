# Tailor

Tailor is a developer tool which tries to simplify inspecting spacings on the website. While holding the toggle key (`Alt` or `option`), you can hover around the page to inspect elements. Immediately, size, margin and padding will be highlighted, and font information will be displayed in the panel.

While Tailor is active you can also click on element to "lock it" and go into the measuring mode. Now Tailor will show the distance between the locked element and any other you hover.

Try it yourself - https://muffinman.io/tailor/

Desktop only.

Our QA team does a lot of checks to make spacings, paddings and font sizes are matching designs. So I made this library/extension hoping it will make their life easier.

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
