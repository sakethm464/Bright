import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { useSession } from "../context/SessionContext.js";

export function NavBar({ minimal = false, currentPage = "home" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useSession();
  const [logoutBusy, setLogoutBusy] = useState(false);
  const accountLabel = user?.user_metadata?.full_name?.trim() || user?.email || "My Account";

  function goHome() {
    navigate("/");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function goToResults() {
    navigate("/results");
  }

  function goToHowItWorks() {
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
      return;
    }

    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleLogout(event) {
    event.preventDefault();
    if (logoutBusy) {
      return;
    }
    setLogoutBusy(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLogoutBusy(false);
    }
  }

  const topbarClassName = minimal ? "topbar auth-topbar minimal-auth-topbar" : "topbar";
  const startDestination = currentPage === "checkin" ? "/checkin" : "/login";

  return html`
    <nav className=${topbarClassName}>
      <button className="brand brand-button" type="button" onClick=${goHome}>
        <img className="brand-mark" src="04-09-45-17_512.webp" alt="bright logo" />
        <div>
          <p>bright</p>
        </div>
      </button>
      <div className="nav-links">
        <button className="nav-link-button" type="button" onClick=${goHome}>Home</button>
        <button className="nav-link-button" type="button" onClick=${goToHowItWorks}>How It Works</button>
        ${
          isAuthenticated
            ? html`
                <div className="nav-account">
                  <button className="nav-cta nav-link-button nav-cta-account" type="button" onClick=${goToResults}>${accountLabel}</button>
                  <div className="nav-account-dropdown">
                    <div className="nav-account-email">${user?.email || "Signed in"}</div>
                    <button type="button" className="nav-account-logout" onClick=${handleLogout}>
                      ${logoutBusy ? "Logging Out..." : "Log Out"}
                    </button>
                  </div>
                </div>
              `
            : html`<button className="nav-cta nav-link-button" type="button" onClick=${() => navigate(startDestination)}>
                Start Check-In
              </button>`
        }
      </div>
    </nav>
  `;
}
