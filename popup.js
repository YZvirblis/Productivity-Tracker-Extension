document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded");
  chrome.storage.local.get(["timeSpent"], (result) => {
    console.log("Time spent data retrieved:", result.timeSpent);
    const statsDiv = document.getElementById("stats");
    const timeSpent = result.timeSpent || {};
    statsDiv.innerHTML = ""; // Clear previous content

    for (const [domain, time] of Object.entries(timeSpent)) {
      const minutes = Math.floor(time / 60); // Convert seconds to minutes
      console.log("Domain:", domain, "Time:", minutes, "minutes");
      const p = document.createElement("p");
      p.textContent = `${domain}: ${minutes} minutes`;
      statsDiv.appendChild(p);
    }
  });
});
