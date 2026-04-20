import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { AppShell } from "../components/AppShell.js";
import { useSession } from "../context/SessionContext.js";
import { buildCheckinPayload, questions } from "../lib/assessment.js";
import { getSupabaseClient, loadSupabase } from "../lib/supabase.js";

export function CheckinPage() {
  const navigate = useNavigate();
  const { client: sessionClient, user } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rawValues, setRawValues] = useState({});
  const [openText, setOpenText] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const question = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  function setOptionValue(questionId, value) {
    setRawValues((current) => ({
      ...current,
      [questionId]: value
    }));
  }

  function goBack() {
    if (currentIndex === 0 || isSaving) {
      return;
    }
    setStatusText("");
    setCurrentIndex((current) => current - 1);
  }

  async function handleFinalSubmit() {
    const payload = buildCheckinPayload(rawValues, openText);
    localStorage.setItem("brightCheckin", JSON.stringify(payload));
    setStatusText("Saving your check-in...");
    setIsSaving(true);

    const proceedToResults = () => {
      navigate("/results");
    };

    const fallbackTimer = window.setTimeout(proceedToResults, 5000);

    try {
      let client = sessionClient;
      if (!client) {
        await loadSupabase();
        client = getSupabaseClient();
      }

      if (!client || !user) {
        window.clearTimeout(fallbackTimer);
        proceedToResults();
        return;
      }

      await client.from("checkins").insert({
        user_id: user.id,
        stress: payload.scores.stress,
        workload: payload.scores.workload,
        sleep: payload.scores.sleep,
        motivation: payload.scores.motivation,
        open_text: payload.open,
        avg_score: payload.avg,
        risk_level: payload.risk
      });
    } catch (error) {
      setStatusText(error?.message || "Something went wrong while saving. Showing your results instead.");
    } finally {
      window.clearTimeout(fallbackTimer);
      proceedToResults();
    }
  }

  async function goNext() {
    setStatusText("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((current) => current + 1);
      return;
    }

    await handleFinalSubmit();
  }

  return html`
    <${AppShell} bodyClassName="checkin-page checkin-wizard-page" minimalNav=${true} currentPage="checkin">
      <main className="checkin-main">
        <section className="wizard-shell">
          <div className="wizard-progress">
            <div className="wizard-progress-bar">
              <div className="wizard-progress-fill" style=${{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="wizard-progress-text">Question ${currentIndex + 1} of ${questions.length}</p>
          </div>

          <article className="wizard-card">
            <p className="wizard-kicker">Burnout check-in</p>
            <h1 className="wizard-question">${question.prompt}</h1>

            <div className="wizard-options">
              ${
                question.type === "textarea"
                  ? html`
                      <textarea
                        className="wizard-textarea"
                        placeholder="You can share as much or as little as you'd like."
                        rows="5"
                        value=${openText}
                        onInput=${(event) => setOpenText(event.target.value)}
                      ></textarea>
                    `
                  : html`
                      <div className=${question.type === "cards" ? "wizard-card-grid" : "wizard-scale"}>
                        ${question.options.map(
                          (option) => html`
                            <button
                              type="button"
                              className=${`wizard-option ${rawValues[question.id] === option.value ? "is-selected" : ""}`}
                              onClick=${() => setOptionValue(question.id, option.value)}
                            >
                              ${option.label}
                            </button>
                          `
                        )}
                      </div>
                    `
              }
            </div>

            <div className="wizard-footer">
              <button className="wizard-back" type="button" disabled=${currentIndex === 0 || isSaving} onClick=${goBack}>
                Back
              </button>
              <button className="primary-btn wizard-next" type="button" disabled=${isSaving} onClick=${goNext}>
                ${currentIndex === questions.length - 1 ? "See My Results" : "Next"}
              </button>
            </div>
            <p className="wizard-status">${statusText}</p>
          </article>
        </section>
      </main>
    </${AppShell}>
  `;
}
