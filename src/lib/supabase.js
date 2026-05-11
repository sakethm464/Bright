const SUPABASE_URL = "https://ztglldcxrlirfjbjbxeu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Z2xsZGN4cmxpcmZqYmpieGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjE1NDQsImV4cCI6MjA5MTQzNzU0NH0.ByknltopFPA3MIq22QVHSyakoOUz22X1dMUIzj0Uy44";

let supabaseLoadingPromise = null;
let supabaseClient = null;

export function loadSupabase() {
  if (window.supabase) {
    return Promise.resolve(window.supabase);
  }

  if (supabaseLoadingPromise) {
    return supabaseLoadingPromise;
  }

  supabaseLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "supabase.umd.js?v=" + Date.now();
    script.async = true;
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error("Supabase script failed to load."));
    document.head.appendChild(script);
  });

  return supabaseLoadingPromise;
}

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!window.supabase) {
    return null;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}
