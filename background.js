let currentTabId;
let startTime;
let intervalId;
let timeSpent = {};

// Initialize time spent data from storage
chrome.storage.local.get(["timeSpent"], (result) => {
  timeSpent = result.timeSpent || {};
  console.log("Loaded time spent data:", timeSpent);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (currentTabId) {
    recordTime(currentTabId);
  }
  startTracking(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === "complete") {
    recordTime(currentTabId);
    startTracking(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTabId) {
    recordTime(currentTabId);
    clearInterval(intervalId);
    currentTabId = null;
  }
});

function startTracking(tabId) {
  currentTabId = tabId;
  startTime = new Date();

  clearInterval(intervalId); // Clear any existing interval
  intervalId = setInterval(() => {
    recordTime(currentTabId);
    startTime = new Date();
  }, 60000); // Record time every minute
}

function recordTime(tabId) {
  if (!startTime) return;

  const endTime = new Date();
  const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
  chrome.tabs.get(tabId, (tab) => {
    const url = new URL(tab.url);
    const domain = url.hostname;
    const today = new Date().toLocaleDateString();

    if (!timeSpent[today]) {
      timeSpent[today] = {};
    }

    timeSpent[today][domain] = (timeSpent[today][domain] || 0) + elapsedTime;
    chrome.storage.local.set({ timeSpent }, () => {
      console.log(
        `Time spent on ${domain}: ${timeSpent[today][domain]} seconds`
      );
    });
  });
  startTime = new Date(); // Reset startTime for the next recording
}

// Clear older data if necessary (e.g., keep only the last 7 days)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["timeSpent"], (result) => {
    const timeSpent = result.timeSpent || {};
    const today = new Date();
    for (const date in timeSpent) {
      const dateObj = new Date(date);
      const diff = (today - dateObj) / (1000 * 60 * 60 * 24); // Difference in days
      if (diff > 7) {
        delete timeSpent[date];
      }
    }
    chrome.storage.local.set({ timeSpent });
  });
});
