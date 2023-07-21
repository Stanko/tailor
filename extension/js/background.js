const states = {
  ON: "ON",
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
  LOAD: "js/load.js",
  UNLOAD: "js/unload.js",
};

function badgeOn(tabId) {
  chrome.action.setBadgeText({
    text: states.ON,
    tabId,
  });
  chrome.action.setBadgeBackgroundColor({
    color: colors.GREEN,
    tabId,
  });
  chrome.action.setBadgeTextColor({
    color: colors.WHITE,
    tabId,
  });
}

function badgeOff(tabId) {
  chrome.action.setBadgeText({
    text: "",
    tabId,
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const badgeText = await chrome.action.getBadgeText({ tabId: tab.id });
  const activate = badgeText !== states.ON;

  if (activate) {
    badgeOn(tab.id);

    // Add CSS
    await chrome.scripting.insertCSS({
      files: [files.CSS],
      target: { tabId: tab.id },
    });

    // Load JS
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [files.LOAD],
    });
  } else {
    badgeOff(tab.id);

    // Remove CSS
    await chrome.scripting.removeCSS({
      files: [files.CSS],
      target: { tabId: tab.id },
    });

    // Destroy instance
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [files.UNLOAD],
    });
  }
});
