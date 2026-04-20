const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const backButton = document.getElementById("back-btn");
const nextButton = document.getElementById("next-btn");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const statusText = document.getElementById("wizard-status");

const questions = [
  {
    id: "stress",
    prompt: "How stressed have you felt this week?",
    type: "scale",
    options: [
      { label: "😌 Very Low", value: 1 },
      { label: "🙂 Low", value: 2 },
      { label: "😐 Moderate", value: 3 },
      { label: "😟 High", value: 4 },
      { label: "😰 Very High", value: 5 }
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
      { label: "5–6 hrs", value: 2 },
      { label: "7–8 hrs", value: 3 },
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

const responses = {};
const rawValues = {};
let currentIndex = 0;

function updateProgress() {
  const total = questions.length;
  const current = currentIndex + 1;
  progressText.textContent = `Question ${current} of ${total}`;
  progressFill.style.width = `${(current / total) * 100}%`;
}

function clearOptions() {
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}

function renderOptions(question) {
  clearOptions();

  if (question.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.className = "wizard-textarea";
    textarea.placeholder = "You can share as much or as little as you'd like.";
    textarea.rows = 5;
    textarea.value = responses[question.id] || "";
    textarea.addEventListener("input", () => {
      responses[question.id] = textarea.value;
    });
    optionsContainer.appendChild(textarea);
    return;
  }

  const optionList = document.createElement("div");
  optionList.className = question.type === "cards" ? "wizard-card-grid" : "wizard-scale";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wizard-option";
    button.textContent = option.label;
    button.dataset.value = option.value;

    if (responses[question.id] === option.value) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {
      responses[question.id] = option.value;
      rawValues[question.id] = option.value;
      optionList.querySelectorAll(".wizard-option").forEach((item) => {
        item.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
    });

    optionList.appendChild(button);
  });

  optionsContainer.appendChild(optionList);
}

function renderQuestion() {
  const question = questions[currentIndex];
  questionText.textContent = question.prompt;
  renderOptions(question);
  updateProgress();
  backButton.disabled = currentIndex === 0;
  nextButton.textContent = currentIndex === questions.length - 1 ? "See My Results" : "Next";
}

function goNext() {
  try {
    statusText.textContent = "";

    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    const scores = {
      stress: rawValues.stress ?? null,
      workload: rawValues.workload ?? null,
      sleep: mapSleepScore(rawValues.sleep),
      motivation: mapMotivationScore(rawValues.motivation)
    };

    const avgValues = Object.values(scores).filter((v) => typeof v === "number");
    const avgScore = avgValues.length ? avgValues.reduce((sum, v) => sum + v, 0) / avgValues.length : null;
    const riskLevel = avgScore === null ? "low" : avgScore >= 3.7 ? "high" : avgScore >= 2.3 ? "medium" : "low";

    localStorage.setItem("brightCheckin", JSON.stringify({
      scores,
      raw: rawValues,
      open: responses.open || "",
      avg: avgScore,
      risk: riskLevel
    }));

    let redirected = false;
    const proceedToResults = () => {
      if (redirected) return;
      redirected = true;
      window.location.href = "results.html";
    };

    // Safety net — redirect after 5 seconds no matter what
    setTimeout(proceedToResults, 5000);

    statusText.textContent = "Saving your check-in...";

    window.loadSupabase().then(() => {
      const client = window.getSupabaseClient();
      if (!client) { proceedToResults(); return; }

      client.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (!user) { proceedToResults(); return; }

        client.from("checkins").insert({
          user_id: user.id,
          stress: scores.stress,
          workload: scores.workload,
          sleep: scores.sleep,
          motivation: scores.motivation,
          open_text: responses.open || "",
          avg_score: avgScore,
          risk_level: riskLevel
        }).finally(proceedToResults);
      });
    }).catch(proceedToResults);
  } catch (err) {
    statusText.textContent = err?.message || "Something went wrong. Please try again.";
  }
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
}

nextButton.addEventListener("click", goNext);
backButton.addEventListener("click", goBack);

window.brightCheckinNext = goNext;

renderQuestion();

function mapSleepScore(value) {
  if (value === 1) return 5;
  if (value === 2) return 4;
  if (value === 3) return 1;
  if (value === 4) return 1;
  return null;
}

function mapMotivationScore(value) {
  if (typeof value !== "number") return null;
  return 6 - value;
}
