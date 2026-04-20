const SUPABASE_URL = "https://ztglldcxrlirfjbjbxeu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Z2xsZGN4cmxpcmZqYmpieGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjE1NDQsImV4cCI6MjA5MTQzNzU0NH0.ByknltopFPA3MIq22QVHSyakoOUz22X1dMUIzj0Uy44";

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

window.loadSupabase = function loadSupabase() {
  if (window.supabase) {
    return Promise.resolve(window.supabase);
  }
  if (window._supabaseLoading) {
    return window._supabaseLoading;
  }
  window._supabaseLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "supabase.umd.js?v=" + Date.now();
    script.async = true;
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error("Supabase script failed to load."));
    document.head.appendChild(script);
  });
  return window._supabaseLoading;
};

window.getSupabaseClient = function getSupabaseClient() {
  if (window._supabaseClient) {
    return window._supabaseClient;
  }
  if (!window.supabase) {
    return null;
  }
  window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return window._supabaseClient;
};
