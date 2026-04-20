import React, { useEffect } from "react";
import { html } from "../lib/html.js";
import { NavBar } from "./NavBar.js";

export function AppShell({ children, bodyClassName = "", minimalNav = false, currentPage = "home" }) {
  useEffect(() => {
    document.body.className = bodyClassName;

    return () => {
      document.body.className = "";
    };
  }, [bodyClassName]);

  return html`
    <div className="page-shell">
      <${NavBar} minimal=${minimalNav} currentPage=${currentPage} />
      ${children}
    </div>
  `;
}
