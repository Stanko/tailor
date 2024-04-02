# Tailor

Tailor is a developer tool that simplifies inspecting spacings on websites. While holding the toggle key (Alt or option), hover around the page to inspect elements. Size, margin, and padding will be highlighted, and font information will be displayed in the panel.

While Tailor is active, you can also click on an element to lock it and enter the measuring mode. Now, Tailor will display the distance between the locked element and any other element you hover over.

You can try it yourself on the demo page - https://muffinman.io/tailor/

Desktop only.

Our QA team does extensive checks to ensure that spacings, paddings, and font sizes match the designs. I created this library/extension hoping to make their lives easier.

## Browser Extensions

<a href="https://addons.mozilla.org/en-US/firefox/addon/tailor/"><img style="height: 70px" src="./docs/img/ff.png"></a>

<a href="https://chromewebstore.google.com/detail/hpnihgcmhjlfpniefhkpadfepbnnjfcm"><img style="height: 70px" src="./docs/img/chrome.png"></a>

## Library

You can also use Tailor directly in your projects. Install the package:

```
npm install @stanko/tailor
```

Load the CSS and instantiate it:

```js
import Tailor from "@stanko/tailor";
import "@stanko/tailor/dist/tailor.css";

new Tailor();
```

I would suggest disabling it in production, something like:

```js
if (NODE_END !== "production") {
  new Tailor();
}
```

Tailor is only available as an ESM module.

## Bookmarklet

You can also load Tailor using this bookmarklet. However, please be aware that depending on a site's security policies, it may not load.

Please drop the following code into the console or bookmark:

```js
javascript: void (async function () {
  const Tailor = await import("https://esm.sh/@stanko/tailor");
  new Tailor.default();
  const style = document.createElement("link");
  style.setAttribute("href", "https://esm.sh/@stanko/tailor/dist/tailor.css");
  style.setAttribute("rel", "stylesheet");
  document.head.append(style);
})();
```

## Setup

- Use node version from `.nvmrc` - `nvm use`
- Install dependencies - `npm install`
- Copy git hooks - `sh ./tools/copy-hooks.sh`

## Development server

- Start a simple development - `npm start`
- Open http://localhost:8000/

## Developing extensions

### Firefox

Project uses [web-ext](https://github.com/mozilla/web-ext) for Firefox extension development.

- Start extension in development mode - `npm run firefox:run`
- Build Firefox extension - `npm run firefox:run`

### Chrome

- For now, copy `manifest-chrome.json` to `manifest.json` and load the unpacked extension
- Build Chrome extension - `npm run chrome:run`

## TODO

- [ ] Info panel improvements
- [ ] When parent is scrolled calculated position is wrong, probably need to subtract the scroll position
- [ ] Handle touch events when simulating phones/tablets in devtools
