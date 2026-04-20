const badgeEl = document.getElementById("results-badge");
const headlineEl = document.getElementById("results-headline");
const notesEl = document.getElementById("results-notes");
const resourceGrid = document.getElementById("resource-grid");
const saveBtn = document.getElementById("save-results-btn");

const stored = JSON.parse(localStorage.getItem("brightCheckin") || "{}");

function getRiskLevel(data) {
  const { scores = {} } = data;
  const values = [scores.stress, scores.workload, scores.sleep, scores.motivation].filter((v) => typeof v === "number");
  if (!values.length) {
    return "low";
  }
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  if (avg >= 3.7) return "high";
  if (avg >= 2.3) return "medium";
  return "low";
}

const riskLevel = stored.risk || getRiskLevel(stored);

const riskContent = {
  low: {
    headline: "You're doing better than you think. ✦",
    badge: "Shining Bright",
    badgeClass: "badge-low"
  },
  medium: {
    headline: "You're carrying a lot. Let's lighten the load.",
    badge: "Flickering",
    badgeClass: "badge-medium"
  },
  high: {
    headline: "You're not alone — and you don't have to push through alone.",
    badge: "Running on Empty",
    badgeClass: "badge-high"
  }
};

const observations = [];
const scores = stored.scores || {};
const raw = stored.raw || {};

if (scores.sleep >= 4) {
  observations.push({
    category: "SLEEP",
    className: "noticed-amber",
    text: "You mentioned getting less sleep than your body needs. Rest is fuel, not a luxury — it helps everything else feel more manageable."
  });
}

if (scores.workload >= 4) {
  observations.push({
    category: "WORKLOAD",
    className: "noticed-teal",
    text: "You're feeling the weight of your workload right now. That pressure is real, and it makes total sense to want more breathing room."
  });
} else if (scores.workload === 3) {
  observations.push({
    category: "WORKLOAD",
    className: "noticed-teal",
    text: "Your workload feels busy at the moment. A little structure could make it feel lighter and more in reach."
  });
}

if (scores.stress >= 4) {
  observations.push({
    category: "STRESS",
    className: "noticed-amber",
    text: "Stress has been running high lately. That is your body asking for support, not a sign you are failing."
  });
}

if (raw.motivation !== undefined && raw.motivation <= 2) {
  observations.push({
    category: "MOTIVATION",
    className: "noticed-rose",
    text: "Your motivation has dipped. That is your mind asking for rest, not a sign of weakness."
  });
}

if (observations.length === 0) {
  observations.push({
    category: "BALANCE",
    className: "noticed-teal",
    text: "You're showing steady balance right now. Keeping gentle routines in place can help protect that calm."
  });
}

const resourcePool = [
  {
    id: "counseling",
    title: "Counseling Services",
    copy: "Talk to someone who gets it. Free and confidential.",
    icon: "🧠",
    button: "Connect"
  },
  {
    id: "tutoring",
    title: "Academic Tutoring",
    copy: "Get support before deadlines pile up.",
    icon: "📚",
    button: "Learn More"
  },
  {
    id: "time",
    title: "Time Management Tools",
    copy: "Small shifts in structure can make a big difference.",
    icon: "🗂️",
    button: "Learn More"
  },
  {
    id: "peer",
    title: "Peer Support Groups",
    copy: "You're not the only one feeling this way.",
    icon: "🤝",
    button: "Connect"
  },
  {
    id: "sleep",
    title: "Sleep & Wellness Tips",
    copy: "Rest is productive. Here's how to get more of it.",
    icon: "😴",
    button: "Learn More"
  },
  {
    id: "mindfulness",
    title: "Mindfulness & Stress Relief",
    copy: "Quick tools to reset when things feel heavy.",
    icon: "🌿",
    button: "Learn More"
  }
];

const resourceLinks = {
  "Counseling Services": "https://caps.unc.edu",
  "Academic Tutoring": "https://learningcenter.unc.edu",
  "Time Management Tools": "https://learningcenter.unc.edu/tips-and-tools/",
  "Peer Support Groups": "https://caps.unc.edu/services/group-therapy/",
  "Sleep & Wellness Tips": "https://healthyheels.unc.edu",
  "Mindfulness & Stress Relief": "https://www.unc.edu/posts/2021/01/22/mindfulness-resources/"
};

function pickResources() {
  const picks = [];

  if (scores.stress >= 4 || raw.motivation <= 2) {
    picks.push("counseling");
  }
  if (scores.stress >= 4) {
    picks.push("mindfulness");
  }
  if (scores.workload >= 4) {
    picks.push("tutoring");
  }
  if (scores.workload >= 3 || raw.motivation <= 3) {
    picks.push("time");
  }
  if (scores.sleep >= 4) {
    picks.push("sleep");
  }
  if (riskLevel !== "low") {
    picks.push("peer");
  }

  const unique = [...new Set(picks)];
  const max = riskLevel === "low" ? 2 : riskLevel === "medium" ? 3 : 4;
  return unique.slice(0, max);
}

function renderNotes() {
  notesEl.innerHTML = "";
  observations.slice(0, 3).forEach((note) => {
    const block = document.createElement("div");
    block.className = `noticed-block ${note.className}`;
    block.innerHTML = `
      <span class="noticed-label">${note.category}</span>
      <p class="noticed-text">${note.text}</p>
    `;
    notesEl.appendChild(block);
  });
}

function renderResources(items) {
  resourceGrid.innerHTML = "";
  items.forEach((resource) => {
    const card = document.createElement("div");
    card.className = "resource-card-mini";
    const link = resourceLinks[resource.title] || resource.link || resource.url || "";
    card.innerHTML = `
      <div class="resource-icon">${resource.icon || "🌿"}</div>
      <div class="resource-body">
        <h3>${resource.title}</h3>
        <p>${resource.description || resource.copy || ""}</p>
        <button class="resource-btn" type="button" data-link="${link}">${resource.action || resource.button || "Learn More"}</button>
      </div>
    `;
    card.dataset.title = resource.title || "";
    card.dataset.link = link;
    const btn = card.querySelector(".resource-btn");
    if (btn && link) {
      btn.addEventListener("click", () => {
        window.open(link, "_blank", "noopener");
      });
    }
    resourceGrid.appendChild(card);
  });
}

function applyRiskUI() {
  const content = riskContent[riskLevel];
  headlineEl.textContent = content.headline;
  badgeEl.textContent = content.badge;
  badgeEl.classList.add(content.badgeClass);
}

applyRiskUI();
renderNotes();

const selectedTags = pickResources();

if (selectedTags.length > 0) {
  const client = window.getSupabaseClient();
  if (!client) {
    const fallback = selectedTags.map((id) => resourcePool.find((item) => item.id === id)).filter(Boolean);
    renderResources(fallback);
  } else {
    client
      .from("resources")
      .select("*")
      .in("tag", selectedTags)
      .then(({ data }) => {
        if (data && data.length) {
          renderResources(data);
        } else {
          const fallback = selectedTags.map((id) => resourcePool.find((item) => item.id === id)).filter(Boolean);
          renderResources(fallback);
        }
      });
  }
} else {
  renderResources(resourcePool.slice(0, 2));
}

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    window.location.href = "checkin.html";
  });
}
