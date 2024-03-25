import browser from "webextension-polyfill";

export const storageKeys = {
  ENABLED: "ENABLED",
  TOGGLE_KEY: "TOGGLE_KEY",
} as const;

const setIcon = (color: "blue" | "gray") => {
  browser.action.setIcon({
    path: {
      "16": `/icons/${color}/16.png`,
      "32": `/icons/${color}/32.png`,
      "48": `/icons/${color}/48.png`,
      "128": `/icons/${color}/128.png`,
      "256": `/icons/${color}/256.png`,
    },
  });
};

const $enabledCheckbox = document.querySelector("input[name=enabled]") as HTMLInputElement;
const $activationKeyRadios = document.querySelectorAll(
  "input[name=toggle-key]"
) as NodeListOf<HTMLInputElement>;

browser.storage.local.get([storageKeys.ENABLED, storageKeys.TOGGLE_KEY]).then((res) => {
  const initEnabled = res[storageKeys.ENABLED] !== false;

  $enabledCheckbox.checked = initEnabled;

  if (initEnabled) {
    setIcon("blue");
  } else {
    setIcon("gray");
  }

  $enabledCheckbox.addEventListener("change", () => {
    browser.storage.local.set({
      [storageKeys.ENABLED]: $enabledCheckbox.checked,
    });
    if ($enabledCheckbox.checked) {
      setIcon("blue");
    } else {
      setIcon("gray");
    }
  });

  const initActivationKey = res[storageKeys.TOGGLE_KEY] || "Control";

  $activationKeyRadios.forEach(($radio) => {
    $radio.checked = initActivationKey === $radio.value;

    $radio.addEventListener("change", () => {
      browser.storage.local.set({
        [storageKeys.TOGGLE_KEY]: $radio.value,
      });
    });
  });
});
