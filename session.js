const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
let sessionActive = false;

function updateLastActive() {
  if (!sessionActive) return;
  localStorage.setItem("brightLastActive", Date.now().toString());
}

function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  return path.substring(path.lastIndexOf("/") + 1);
}

(async function initSessionGuard() {
  if (!window.loadSupabase) return;

  try {
    await window.loadSupabase();
  } catch (err) {
    return;
  }

  const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
  if (!client) return;

  let userEmail = "";

  const lastActive = Number(localStorage.getItem("brightLastActive") || 0);
  if (lastActive && Date.now() - lastActive > SESSION_MAX_AGE_MS) {
    try {
      await client.auth.signOut();
    } finally {
      localStorage.clear();
      window.location.href = "login.html";
    }
    return;
  }

  const { data } = await client.auth.getSession();
  sessionActive = Boolean(data?.session);
  userEmail = data?.session?.user?.email || "";

  if (sessionActive) {
    updateLastActive();
  }

  const page = getCurrentPage();

  if (page === "login.html" && sessionActive) {
    window.location.href = "checkin.html";
    return;
  }

  if (page === "checkin.html") {
    if (!sessionActive) {
      window.location.href = "login.html";
      return;
    }

    const hasResults = localStorage.getItem("brightCheckin") !== null;
    if (hasResults) {
      window.location.href = "results.html";
      return;
    }
  }

  if (sessionActive) {
    await enhanceNavForSession(client, userEmail);
  }
})();

document.addEventListener("click", () => {
  updateLastActive();
});

async function enhanceNavForSession(client, userEmail) {
  const navCta = document.querySelector(".nav-cta");
  if (!navCta) return;

  let email = userEmail;
  if (!email) {
    const { data } = await client.auth.getUser();
    email = data?.user?.email || "";
  }

  navCta.textContent = "My Account";
  navCta.setAttribute("href", "#");
  navCta.classList.add("nav-cta-account");

  const wrapper = document.createElement("div");
  wrapper.className = "nav-account";
  navCta.parentNode.insertBefore(wrapper, navCta);
  wrapper.appendChild(navCta);

  const dropdown = document.createElement("div");
  dropdown.className = "nav-account-dropdown";
  dropdown.innerHTML = `
    <div class="nav-account-email">${email || "Signed in"}</div>
    <button type="button" class="nav-account-logout">Log Out</button>
  `;

  wrapper.appendChild(dropdown);

  const logoutBtn = dropdown.querySelector(".nav-account-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      await client.auth.signOut();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
}
