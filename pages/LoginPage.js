import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { html } from "../lib/html.js";
import { AppShell } from "../components/AppShell.js";
import { useSession } from "../context/SessionContext.js";
import { getSupabaseClient, loadSupabase } from "../lib/supabase.js";
import { getRiskLevelFromScores } from "../lib/assessment.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { client: sessionClient } = useSession();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [signupValues, setSignupValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  function setMode(signupMode) {
    setIsSignupMode(signupMode);
    setFeedback("");
  }

  async function getClient() {
    if (sessionClient) {
      return sessionClient;
    }

    await loadSupabase();
    return getSupabaseClient();
  }

  function buildStoredCheckinFromRecord(record) {
    const scores = {
      stress: record?.stress ?? null,
      workload: record?.workload ?? null,
      sleep: record?.sleep ?? null,
      motivation: record?.motivation ?? null
    };

    const raw = {
      stress: record?.stress ?? undefined,
      workload: record?.workload ?? undefined,
      sleep: record?.sleep === 5 ? 1 : record?.sleep === 4 ? 2 : record?.sleep === 1 ? 3 : undefined,
      motivation: typeof record?.motivation === "number" ? 6 - record.motivation : undefined
    };

    return {
      scores,
      raw,
      open: record?.open_text || "",
      avg: record?.avg_score ?? null,
      risk: record?.risk_level || getRiskLevelFromScores(scores)
    };
  }

  async function routeAfterLogin(client) {
    const { data: userData } = await client.auth.getUser();
    const user = userData?.user;

    if (!user) {
      sessionStorage.removeItem("brightPostLoginRedirect");
      navigate("/checkin");
      return;
    }

    const { data: latestCheckin, error } = await client
      .from("checkins")
      .select("stress, workload, sleep, motivation, open_text, avg_score, risk_level, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !latestCheckin) {
      sessionStorage.removeItem("brightPostLoginRedirect");
      navigate("/checkin");
      return;
    }

    localStorage.setItem("brightCheckin", JSON.stringify(buildStoredCheckinFromRecord(latestCheckin)));
    sessionStorage.removeItem("brightPostLoginRedirect");
    navigate("/results");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setFeedback("");

    let client = null;

    try {
      client = await getClient();
    } catch (error) {
      setFeedback("Supabase library failed to load. Check your connection and reload.");
      return;
    }

    if (!client) {
      setFeedback("Supabase library didn't load. Check your internet or run via http://localhost:8000.");
      return;
    }

    setFeedback("Signing you in...");

    try {
      sessionStorage.setItem("brightPostLoginRedirect", "true");
      const { error } = await client.auth.signInWithPassword({
        email: loginValues.email,
        password: loginValues.password
      });
      if (error) {
        sessionStorage.removeItem("brightPostLoginRedirect");
        setFeedback(error.message);
        return;
      }

      setFeedback("Loading your account...");
      await routeAfterLogin(client);
    } catch (error) {
      sessionStorage.removeItem("brightPostLoginRedirect");
      setFeedback(error?.message || "Login failed. Please try again.");
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setFeedback("");

    const fullName = signupValues.fullName.trim();
    const email = signupValues.email;
    const password = signupValues.password;

    if (password !== signupValues.confirmPassword) {
      setFeedback("Passwords do not match yet. Please try again.");
      return;
    }

    let client = null;

    try {
      client = await getClient();
    } catch (error) {
      setFeedback("Supabase library failed to load. Check your connection and reload.");
      return;
    }

    if (!client) {
      setFeedback("Supabase library didn't load. Check your internet or run via http://localhost:8000.");
      return;
    }

    setFeedback("Creating your account...");

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        setFeedback(error.message);
        return;
      }

      if (data?.session) {
        navigate("/checkin");
        return;
      }

      setFeedback("Account created. You can log in now.");
      setIsSignupMode(false);
    } catch (error) {
      setFeedback(error?.message || "Sign up failed. Please try again.");
    }
  }

  return html`
    <${AppShell} bodyClassName="auth-page auth-page-minimal" minimalNav=${true} currentPage="login">
      <main className="auth-main minimal-auth-main">
        <section className="auth-shell minimal-auth-shell">
          <article className="auth-card minimal-auth-card">
            <div className="auth-card-header">
              <h2 id="auth-title">let's brighten your day!</h2>
              <p id="auth-description" className="auth-description">Log in or create an account to continue</p>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Auth mode">
              <button className=${`auth-tab ${!isSignupMode ? "is-active" : ""}`} type="button" onClick=${() => setMode(false)}>
                Log In
              </button>
              <button className=${`auth-tab ${isSignupMode ? "is-active" : ""}`} type="button" onClick=${() => setMode(true)}>
                Sign Up
              </button>
            </div>

            ${
              !isSignupMode
                ? html`
                    <form className="auth-form" onSubmit=${handleLogin}>
                      <label className="auth-field">
                        <span>Email</span>
                        <input
                          type="email"
                          name="email"
                          placeholder="student@example.edu"
                          required
                          value=${loginValues.email}
                          onInput=${(event) => setLoginValues({ ...loginValues, email: event.target.value })}
                        />
                      </label>
                      <label className="auth-field">
                        <span>Password</span>
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter your password"
                          required
                          value=${loginValues.password}
                          onInput=${(event) => setLoginValues({ ...loginValues, password: event.target.value })}
                        />
                      </label>
                      <button className="primary-btn auth-submit" type="submit">Log In</button>
                    </form>
                  `
                : html`
                    <form className="auth-form" onSubmit=${handleSignup}>
                      <label className="auth-field">
                        <span>Full Name</span>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Your full name"
                          required
                          value=${signupValues.fullName}
                          onInput=${(event) => setSignupValues({ ...signupValues, fullName: event.target.value })}
                        />
                      </label>
                      <label className="auth-field">
                        <span>Email</span>
                        <input
                          type="email"
                          name="email"
                          placeholder="student@example.edu"
                          required
                          value=${signupValues.email}
                          onInput=${(event) => setSignupValues({ ...signupValues, email: event.target.value })}
                        />
                      </label>
                      <label className="auth-field">
                        <span>Password</span>
                        <input
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          required
                          value=${signupValues.password}
                          onInput=${(event) => setSignupValues({ ...signupValues, password: event.target.value })}
                        />
                      </label>
                      <label className="auth-field">
                        <span>Confirm Password</span>
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          required
                          value=${signupValues.confirmPassword}
                          onInput=${(event) => setSignupValues({ ...signupValues, confirmPassword: event.target.value })}
                        />
                      </label>
                      <button className="primary-btn auth-submit" type="submit">Create Account</button>
                    </form>
                  `
            }

            <p className="auth-feedback" aria-live="polite">${feedback}</p>
            <button className="auth-toggle" type="button" onClick=${() => setMode(!isSignupMode)}>
              ${isSignupMode ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </article>

          <p className="auth-tagline">Every check-in is a step toward balance.</p>
        </section>
      </main>
    </${AppShell}>
  `;
}
