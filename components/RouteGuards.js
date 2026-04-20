import React from "react";
import { Navigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { useSession } from "../context/SessionContext.js";

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useSession();

  if (loading) {
    return html`<p className="route-status">Loading...</p>`;
  }

  if (!isAuthenticated) {
    return html`<${Navigate} to="/login" replace=${true} />`;
  }

  return children;
}

export function LoginRoute({ children }) {
  const { loading, isAuthenticated } = useSession();
  const isPostLoginRedirecting = sessionStorage.getItem("brightPostLoginRedirect") === "true";

  if (loading) {
    return html`<p className="route-status">Loading...</p>`;
  }

  if (isPostLoginRedirecting) {
    return children;
  }

  if (isAuthenticated) {
    return html`<${Navigate} to="/checkin" replace=${true} />`;
  }

  return children;
}

export function CheckinResultsGuard({ children }) {
  const hasResults = localStorage.getItem("brightCheckin") !== null;

  if (hasResults) {
    return html`<${Navigate} to="/results" replace=${true} />`;
  }

  return children;
}
