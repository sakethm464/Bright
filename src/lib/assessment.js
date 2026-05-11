export const questions = [
  {
    id: "stress",
    prompt: "How stressed have you felt this week?",
    type: "scale",
    options: [
      { label: "Very Low", value: 1 },
      { label: "Low", value: 2 },
      { label: "Moderate", value: 3 },
      { label: "High", value: 4 },
      { label: "Very High", value: 5 }
    ]
  },
  {
    id: "workload",
    prompt: "How manageable does your workload feel right now?",
    type: "scale",
    options: [
      { label: "Totally Fine", value: 1 },
      { label: "Mostly Manageable", value: 2 },
      { label: "Busy but Okay", value: 3 },
      { label: "Hard to Keep Up", value: 4 },
      { label: "Completely Overwhelmed", value: 5 }
    ]
  },
  {
    id: "sleep",
    prompt: "How has your sleep been lately?",
    type: "cards",
    options: [
      { label: "Less than 5 hrs", value: 1 },
      { label: "5-6 hrs", value: 2 },
      { label: "7-8 hrs", value: 3 },
      { label: "8+ hrs", value: 4 }
    ]
  },
  {
    id: "motivation",
    prompt: "How motivated have you felt to do your work or attend class?",
    type: "scale",
    options: [
      { label: "No motivation at all", value: 1 },
      { label: "Low motivation", value: 2 },
      { label: "Somewhat motivated", value: 3 },
      { label: "Mostly motivated", value: 4 },
      { label: "Fully motivated", value: 5 }
    ]
  },
  {
    id: "open",
    prompt: "Is there anything specific weighing on you this week? (optional)",
    type: "textarea"
  }
];

export function mapSleepScore(value) {
  if (value === 1) return 5;
  if (value === 2) return 4;
  if (value === 3) return 1;
  if (value === 4) return 1;
  return null;
}

export function mapMotivationScore(value) {
  if (typeof value !== "number") return null;
  return 6 - value;
}

export function getRiskLevelFromScores(scores = {}) {
  const values = [scores.stress, scores.workload, scores.sleep, scores.motivation].filter((value) => typeof value === "number");
  if (!values.length) {
    return "low";
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (average >= 3.7) return "high";
  if (average >= 2.3) return "medium";
  return "low";
}

export function buildCheckinPayload(rawValues = {}, openText = "") {
  const scores = {
    stress: rawValues.stress ?? null,
    workload: rawValues.workload ?? null,
    sleep: mapSleepScore(rawValues.sleep),
    motivation: mapMotivationScore(rawValues.motivation)
  };

  const numericValues = Object.values(scores).filter((value) => typeof value === "number");
  const avgScore = numericValues.length
    ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
    : null;

  const riskLevel = avgScore === null ? "low" : avgScore >= 3.7 ? "high" : avgScore >= 2.3 ? "medium" : "low";

  return {
    scores,
    raw: rawValues,
    open: openText,
    avg: avgScore,
    risk: riskLevel
  };
}
