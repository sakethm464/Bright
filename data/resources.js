export const riskContent = {
  low: {
    headline: "You're doing better than you think.",
    badge: "Shining Bright",
    badgeClass: "badge-low"
  },
  medium: {
    headline: "You're carrying a lot. Let's lighten the load.",
    badge: "Flickering",
    badgeClass: "badge-medium"
  },
  high: {
    headline: "You're not alone and you don't have to push through alone.",
    badge: "Running on Empty",
    badgeClass: "badge-high"
  }
};

export const resourcePool = [
  {
    id: "counseling",
    title: "Counseling Services",
    copy: "Talk to someone who gets it. Free and confidential.",
    icon: "\uD83E\uDDE0",
    button: "Connect"
  },
  {
    id: "tutoring",
    title: "Academic Tutoring",
    copy: "Get support before deadlines pile up.",
    icon: "\uD83D\uDCDA",
    button: "Learn More"
  },
  {
    id: "time",
    title: "Time Management Tools",
    copy: "Small shifts in structure can make a big difference.",
    icon: "\uD83D\uDDC2\uFE0F",
    button: "Learn More"
  },
  {
    id: "peer",
    title: "Peer Support Groups",
    copy: "You're not the only one feeling this way.",
    icon: "\uD83E\uDD1D",
    button: "Connect"
  },
  {
    id: "sleep",
    title: "Sleep & Wellness Tips",
    copy: "Rest is productive. Here's how to get more of it.",
    icon: "\uD83D\uDE34",
    button: "Learn More"
  },
  {
    id: "mindfulness",
    title: "Mindfulness & Stress Relief",
    copy: "Quick tools to reset when things feel heavy.",
    icon: "\uD83C\uDF3F",
    button: "Learn More"
  }
];

export const resourceLinks = {
  "Counseling Services": "https://caps.unc.edu",
  "Academic Tutoring": "https://learningcenter.unc.edu",
  "Time Management Tools": "https://learningcenter.unc.edu/tips-and-tools/",
  "Peer Support Groups": "https://caps.unc.edu/services/group-therapy/",
  "Sleep & Wellness Tips": "https://healthyheels.unc.edu",
  "Mindfulness & Stress Relief": "https://www.unc.edu/posts/2021/01/22/mindfulness-resources/"
};

export function buildObservations(scores = {}, raw = {}) {
  const observations = [];

  if (scores.sleep >= 4) {
    observations.push({
      category: "SLEEP",
      className: "noticed-amber",
      text: "You mentioned getting less sleep than your body needs. Rest is fuel, not a luxury, and it helps everything else feel more manageable."
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

  if (!observations.length) {
    observations.push({
      category: "BALANCE",
      className: "noticed-teal",
      text: "You're showing steady balance right now. Keeping gentle routines in place can help protect that calm."
    });
  }

  return observations;
}

export function pickResources(scores = {}, raw = {}, riskLevel = "low") {
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

export function getResourceIcon(resource = {}) {
  if (resource.icon && resource.icon.length <= 3) {
    return resource.icon;
  }

  const key = `${resource.id || ""} ${resource.tag || ""} ${resource.title || ""}`.toLowerCase();

  if (key.includes("counsel") || key.includes("support")) return "\uD83E\uDDE0";
  if (key.includes("tutor") || key.includes("academic") || key.includes("study")) return "\uD83D\uDCDA";
  if (key.includes("time") || key.includes("plan")) return "\uD83D\uDDC2\uFE0F";
  if (key.includes("peer") || key.includes("group") || key.includes("community")) return "\uD83E\uDD1D";
  if (key.includes("sleep") || key.includes("wellness") || key.includes("rest")) return "\uD83D\uDE34";
  if (key.includes("mindful") || key.includes("stress") || key.includes("calm")) return "\uD83C\uDF3F";

  return "\uD83C\uDF3F";
}
