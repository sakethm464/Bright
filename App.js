import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { html } from "./lib/html.js";
import { SessionProvider } from "./context/SessionContext.js";
import { ProtectedRoute, LoginRoute, CheckinResultsGuard } from "./components/RouteGuards.js";
import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { CheckinPage } from "./pages/CheckinPage.js";
import { ResultsPage } from "./pages/ResultsPage.js";

export function App() {
  return html`
    <${SessionProvider}>
      <${HashRouter}>
        <${Routes}>
          <${Route} path="/" element=${html`<${HomePage} />`} />
          <${Route}
            path="/login"
            element=${html`<${LoginRoute}><${LoginPage} /></${LoginRoute}>`}
          />
          <${Route}
            path="/checkin"
            element=${html`<${ProtectedRoute}><${CheckinResultsGuard}><${CheckinPage} /></${CheckinResultsGuard}></${ProtectedRoute}>`}
          />
          <${Route} path="/results" element=${html`<${ResultsPage} />`} />
          <${Route} path="*" element=${html`<${Navigate} to="/" replace=${true} />`} />
        </${Routes}>
      </${HashRouter}>
    </${SessionProvider}>
  `;
}
