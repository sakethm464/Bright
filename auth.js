const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authToggle = document.getElementById("auth-toggle");
const authTitle = document.getElementById("auth-title");
const authDescription = document.getElementById("auth-description");
const authFeedback = document.getElementById("auth-feedback");
const authTabs = document.querySelectorAll(".auth-tab");

let isSignupMode = false;

function setMode(signupMode) {
  isSignupMode = signupMode;
  loginForm.classList.toggle("auth-form-hidden", signupMode);
  signupForm.classList.toggle("auth-form-hidden", !signupMode);
  authTitle.textContent = "let's brighten your day!";
  authDescription.textContent = signupMode
    ? "Log in or create an account to continue"
    : "Log in or create an account to continue";
  authToggle.textContent = signupMode
    ? "Already have an account? Log in"
    : "Don't have an account? Sign up";
  authFeedback.textContent = "";

  authTabs.forEach((tab) => {
    const isSignup = tab.dataset.mode === "signup";
    tab.classList.toggle("is-active", signupMode === isSignup);
  });
}

function goToCheckin() {
  window.location.href = "checkin.html";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authFeedback.textContent = "";

  if (window.loadSupabase) {
    try {
      await window.loadSupabase();
    } catch (err) {
      authFeedback.textContent = "Supabase library failed to load. Check your connection and reload.";
      return;
    }
  }

  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
    authFeedback.textContent = "Supabase library didn't load. Check your internet or run via http://localhost:8000.";
    return;
  }

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  authFeedback.textContent = "Signing you in...";

  try {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      authFeedback.textContent = error.message;
      return;
    }
    goToCheckin();
  } catch (err) {
    authFeedback.textContent = err?.message || "Login failed. Please try again.";
  }
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authFeedback.textContent = "";

  if (window.loadSupabase) {
    try {
      await window.loadSupabase();
    } catch (err) {
      authFeedback.textContent = "Supabase library failed to load. Check your connection and reload.";
      return;
    }
  }

  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) {
    authFeedback.textContent = "Supabase library didn't load. Check your internet or run via http://localhost:8000.";
    return;
  }

  const formData = new FormData(signupForm);
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const email = String(formData.get("email") || "");

  if (password !== confirmPassword) {
    authFeedback.textContent = "Passwords do not match yet. Please try again.";
    return;
  }

  authFeedback.textContent = "Creating your account...";

  try {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      authFeedback.textContent = error.message;
      return;
    }

    if (data?.session) {
      goToCheckin();
      return;
    }

    authFeedback.textContent = "Account created. You can log in now.";
  } catch (err) {
    authFeedback.textContent = err?.message || "Sign up failed. Please try again.";
  }
});

authToggle.addEventListener("click", () => {
  setMode(!isSignupMode);
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setMode(tab.dataset.mode === "signup");
  });
});

setMode(false);
