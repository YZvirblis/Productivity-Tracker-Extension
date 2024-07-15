let currentTabId;
let startTime;
let timeSpent = {};

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab activated:", activeInfo.tabId);
  if (currentTabId) {
    recordTime(currentTabId);
  }
  currentTabId = activeInfo.tabId;
  startTime = new Date();
  console.log("Start time set to:", startTime);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === "complete") {
    console.log("Tab updated:", tab.url);
    recordTime(currentTabId);
    startTime = new Date();
    console.log("Start time reset to:", startTime);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab removed:", tabId);
  if (tabId === currentTabId) {
    recordTime(currentTabId);
    currentTabId = null;
  }
});

function recordTime(tabId) {
  if (!startTime) return;

  const endTime = new Date();
  const elapsedTime = (endTime - startTime) / 1000; // Convert to seconds
  console.log("Recording time for tab:", tabId, "Elapsed time:", elapsedTime);

  chrome.tabs.get(tabId, (tab) => {
    const url = new URL(tab.url);
    const domain = url.hostname;
    console.log("Domain:", domain);
    timeSpent[domain] = (timeSpent[domain] || 0) + elapsedTime;
    console.log("Time spent on", domain, ":", timeSpent[domain]);
    chrome.storage.local.set({ timeSpent }, () => {
      console.log("Time spent data saved:", timeSpent);
    });
  });
  startTime = new Date(); // Reset startTime for the next recording
}
