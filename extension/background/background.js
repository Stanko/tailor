const states = {
  ON: "ON", // ☩
  OFF: "OFF",
};

const colors = {
  RED: "#f14722",
  PURPLE: "#953edd",
  BLUE: "#0b99ff",
  GREEN: "#00aa60",
  WHITE: "#ffffff",
  BLACK: "#000000",
};

const files = {
  CSS: "tailor/tailor.css",
  LOAD: "background/load.js",
  TAILOR: "tailor/index.js",
  UNLOAD: "background/unload.js",
};

function badgeOn(tabId) {
  browser.action.setBadgeText({ text: states.ON, tabId });
  browser.action.setBadgeBackgroundColor({ color: colors.GREEN, tabId });
  browser.action.setBadgeTextColor({ color: colors.WHITE, tabId });
}

function badgeOff(tabId) {
  browser.action.setBadgeText({ text: "", tabId });
}

let initialized = false;

browser.action.onClicked.addListener(async (tab) => {
  // if (!initialized) {
  //   await browser.action.setPopup({ popup: "popup.html" });
  //   browser.action.openPopup();
  //   return;
  // }
  const badgeText = await browser.action.getBadgeText({ tabId: tab.id });
  const activate = badgeText !== states.ON;

  try {
    if (activate) {
      badgeOn(tab.id);

      // Add CSS
      await browser.scripting.insertCSS({
        files: [files.CSS],
        target: { tabId: tab.id },
      });

      // Load JS
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: [files.TAILOR],
      });
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: [files.LOAD],
      });
    } else {
      badgeOff(tab.id);

      // Remove CSS
      await browser.scripting.removeCSS({
        files: [files.CSS],
        target: { tabId: tab.id },
      });

      // Destroy instance
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: [files.UNLOAD],
      });
    }
  } catch (e) {
    console.log("----------");
    console.log(e);
  }
});
