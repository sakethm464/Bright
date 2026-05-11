import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { AppShell } from "../components/AppShell.js";
import { useSession } from "../context/SessionContext.js";

const qaSlides = [
  {
    question: "why this matters?",
    answer: "Students often wait too long to ask for help, and stress starts hurting focus, grades, and sleep."
  },
  {
    question: "what do students need?",
    answer: "They need quick reflection, clear feedback, and simple access to the right support."
  },
  {
    question: "so...why bright?",
    answer: "bright helps students notice warning signs early and take action before burnout gets worse."
  }
];

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasSavedResults = localStorage.getItem("brightCheckin") !== null;

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal, .reveal-step");
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  function goToLogin() {
    navigate(isAuthenticated ? "/results" : "/login");
  }

  const heroButtonLabel = isAuthenticated && hasSavedResults ? "See your Results" : "Start Check-In";

  function goToSlide(direction) {
    setCurrentSlide((previous) => (previous + direction + qaSlides.length) % qaSlides.length);
  }

  return html`
    <${AppShell} currentPage="home">
      <header className="hero" id="home">
        <div className="hero-grid">
          <div className="hero-video-layer" aria-hidden="true">
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src="10397876-uhd_4096_2160_25fps.mp4" type="video/mp4" />
            </video>
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src="10506265-uhd_4096_2160_25fps.mp4" type="video/mp4" />
            </video>
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src="5535722-uhd_3840_2160_25fps.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hero-overlay" aria-hidden="true"></div>
          <section className="hero-copy">
            <h1>
              <span className="hero-line">
                stars shine <span className="bright-word">bright</span>, not <span className="burnout-word">burnout</span>
              </span>
            </h1>
            <p className="hero-text">Catch the signs of burnout before they take over your semester.</p>
            <div className="hero-actions">
              <button className="primary-btn" type="button" onClick=${goToLogin}>${heroButtonLabel}</button>
            </div>
          </section>
        </div>
      </header>

      <main>
        <section className="section carousel-section reveal">
          <div className="section-heading section-heading-centered">
            <h2>A <em>small</em> intervention that makes a <strong>big</strong> difference.</h2>
          </div>

          <div className="qa-carousel">
            <button className="carousel-arrow" type="button" aria-label="Previous question" onClick=${() => goToSlide(-1)}>
              ←
            </button>

            <article className="qa-viewport">
              <div className="qa-track" style=${{ transform: `translateX(-${currentSlide * 100}%)` }}>
                ${qaSlides.map(
                  (slide) => html`
                    <div className="qa-card">
                      <div className="qa-grid">
                        <div className="qa-side qa-question">
                          <p className="qa-label">Q:</p>
                          <h3>${slide.question}</h3>
                        </div>
                        <div className="qa-divider" aria-hidden="true"></div>
                        <div className="qa-side qa-answer">
                          <p className="qa-label">A:</p>
                          <p>${slide.answer}</p>
                        </div>
                      </div>
                    </div>
                  `
                )}
              </div>
            </article>

            <button className="carousel-arrow" type="button" aria-label="Next question" onClick=${() => goToSlide(1)}>
              →
            </button>
          </div>
        </section>

        <section className="section how-section reveal" id="how-it-works">
          <div className="section-heading section-heading-centered">
            <h2>how does bright work?</h2>
          </div>
          <div className="how-list">
            <article className="how-card reveal-step">
              <span className="how-number">01</span>
              <p>Students complete a quick burnout check-in.</p>
            </article>
            <article className="how-card how-card-shift reveal-step">
              <span className="how-number">02</span>
              <p>The app estimates burnout risk as low, medium, or high.</p>
            </article>
            <article className="how-card reveal-step">
              <span className="how-number">03</span>
              <p>Students get targeted support recommendations right away.</p>
            </article>
          </div>
        </section>

        <section className="section closing-section reveal">
          <div className="closing-card">
            <h2>so, want to give it a try?</h2>
            <button className="closing-btn" type="button" onClick=${goToLogin}>Start Check-In</button>
          </div>
        </section>
      </main>
    </${AppShell}>
  `;
}
