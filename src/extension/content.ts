import browser from "webextension-polyfill";

import { storageKeys } from "../utils/constants";
import Tailor from "..";

let instance: Tailor;

const toggle = async (enabled: boolean) => {
  const data = await browser.storage.local.get([storageKeys.TOGGLE_KEY]);

  if (enabled) {
    instance = new Tailor(data[storageKeys.TOGGLE_KEY]);
  } else {
    instance?.destroy();
  }
};

browser.storage.local.onChanged.addListener((changes) => {
  const changedItems = Object.keys(changes);

  changedItems.forEach((item) => {
    if (item === storageKeys.TOGGLE_KEY && instance) {
      instance.updateToggleKey(changes[item].newValue);
    } else if (item === storageKeys.ENABLED) {
      toggle(changes[item].newValue);
    }
  });
});

const init = async () => {
  const data = await browser.storage.local.get([storageKeys.ENABLED]);

  // Tailor is enabled by default
  // Only disable it if the value is explicitly set to false
  const enabled = data[storageKeys.ENABLED] !== false;

  toggle(enabled);
};

init();
