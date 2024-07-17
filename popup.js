document.addEventListener("DOMContentLoaded", () => {
  const statsDiv = document.getElementById("stats");
  const showMoreButton = document.getElementById("show-more");
  let expanded = false;

  // Load time spent data from storage
  chrome.storage.local.get(["timeSpent"], (result) => {
    const timeSpent = result.timeSpent || {};
    displayStats(timeSpent);
  });

  showMoreButton.addEventListener("click", () => {
    expanded = !expanded;
    showMoreButton.textContent = expanded ? "Show Less" : "Show More";
    chrome.storage.local.get(["timeSpent"], (result) => {
      const timeSpent = result.timeSpent || {};
      displayStats(timeSpent);
    });
  });

  function displayStats(timeSpent) {
    statsDiv.innerHTML = ""; // Clear previous content
    const today = new Date().toLocaleDateString();
    const domains = Object.keys(timeSpent[today] || {}).sort(
      (a, b) => timeSpent[today][b] - timeSpent[today][a]
    );
    const topDomains = expanded ? domains : domains.slice(0, 5);
    const maxTime = timeSpent[today][domains[0]];

    topDomains.forEach((domain) => {
      const time = timeSpent[today][domain];
      const minutes = Math.floor(time / 60); // Convert seconds to minutes
      const div = document.createElement("div");
      div.className = "stat-item";
      const p = document.createElement("p");
      p.textContent = `${domain}: ${minutes} minutes`;
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `${(time / maxTime) * 100}%`;
      div.appendChild(p);
      div.appendChild(bar);
      statsDiv.appendChild(div);
    });
  }
});
