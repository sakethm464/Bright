import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { AppShell } from "../components/AppShell.js";
import { getRiskLevelFromScores } from "../lib/assessment.js";
import { buildObservations, getResourceIcon, pickResources, resourceLinks, resourcePool, riskContent } from "../data/resources.js";
import { useSession } from "../context/SessionContext.js";
import { getSupabaseClient, loadSupabase } from "../lib/supabase.js";

export function ResultsPage() {
  const navigate = useNavigate();
  const { client: sessionClient } = useSession();
  const [stored] = useState(() => JSON.parse(localStorage.getItem("brightCheckin") || "{}"));
  const [resourceItems, setResourceItems] = useState([]);
  const riskLevel = stored.risk || getRiskLevelFromScores(stored.scores || {});
  const content = riskContent[riskLevel] || riskContent.low;
  const observations = buildObservations(stored.scores || {}, stored.raw || {}).slice(0, 3);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      const selectedTags = pickResources(stored.scores || {}, stored.raw || {}, riskLevel);
      if (!selectedTags.length) {
        setResourceItems(resourcePool.slice(0, 2));
        return;
      }

      let client = sessionClient;
      if (!client) {
        try {
          await loadSupabase();
          client = getSupabaseClient();
        } catch (error) {
          client = null;
        }
      }

      if (!client) {
        if (!cancelled) {
          setResourceItems(selectedTags.map((id) => resourcePool.find((item) => item.id === id)).filter(Boolean));
        }
        return;
      }

      const { data } = await client.from("resources").select("*").in("tag", selectedTags);

      if (cancelled) {
        return;
      }

      if (data && data.length) {
        setResourceItems(data);
        return;
      }

      setResourceItems(selectedTags.map((id) => resourcePool.find((item) => item.id === id)).filter(Boolean));
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [riskLevel, sessionClient, stored]);

  function openResource(resource) {
    const link = resourceLinks[resource.title] || resource.link || resource.url || "";
    if (link) {
      window.open(link, "_blank", "noopener");
    }
  }

  return html`
    <${AppShell} bodyClassName="results-page" minimalNav=${true} currentPage="results">
      <main className="results-main">
        <section className="results-hero">
          <h1 id="results-headline">${content.headline}</h1>
          <p className="results-subtext">Based on your check-in, here's what we noticed and what might help.</p>
        </section>

        <section className="results-layout">
          <article className="results-card">
            <div className="results-card-head">
              <h2>What we noticed</h2>
              <span className=${`results-badge ${content.badgeClass}`}>${content.badge}</span>
            </div>
            <div className="results-notes-grid">
              ${observations.map(
                (note) => html`
                  <div className=${`noticed-block ${note.className}`}>
                    <span className="noticed-label">${note.category}</span>
                    <p className="noticed-text">${note.text}</p>
                  </div>
                `
              )}
            </div>
            <div className="results-divider"></div>
            <p className="results-note-footer">Noticing these patterns is already a step forward.</p>
          </article>

          <article className="results-card">
            <h2>Recommended resources</h2>
            <div className="resource-grid">
              ${resourceItems.map(
                (resource) => html`
                  <div className="resource-card-mini">
                    <div className="resource-icon" aria-hidden="true">${getResourceIcon(resource)}</div>
                    <div className="resource-body">
                      <h3>${resource.title}</h3>
                      <p>${resource.description || resource.copy || ""}</p>
                      <button className="resource-btn" type="button" onClick=${() => openResource(resource)}>
                        ${resource.action || resource.button || "Learn More"}
                      </button>
                    </div>
                  </div>
                `
              )}
            </div>
          </article>
        </section>

        <section className="results-footer">
          <button className="primary-btn results-save" type="button" onClick=${() => {
            localStorage.removeItem("brightCheckin");
            navigate("/checkin");
          }}>
            Retake Check-In
          </button>
          <p className="results-privacy">Your responses are private and never shared without your consent.</p>
        </section>
      </main>
    </${AppShell}>
  `;
}
