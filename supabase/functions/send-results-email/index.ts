import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRisk(riskLevel: string) {
  const normalized = (riskLevel || "").toLowerCase();
  if (normalized === "high") return "Running on Empty";
  if (normalized === "medium") return "Flickering";
  return "Shining Bright";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  let payload: {
    email?: string;
    riskLevel?: string;
    observations?: { category?: string; text?: string }[];
    resources?: { title?: string; link?: string }[];
  };

  try {
    payload = await req.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const email = payload.email?.trim();
  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required." }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const observations = Array.isArray(payload.observations) ? payload.observations : [];
  const resources = Array.isArray(payload.resources) ? payload.resources : [];
  const riskLabel = formatRisk(payload.riskLevel || "");

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY." }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const observationsHtml = observations.length
    ? observations
      .map((item) => {
        const category = item.category ? escapeHtml(item.category) : "Observation";
        const text = item.text ? escapeHtml(item.text) : "";
        return `<li style="margin-bottom:12px;"><strong>${category}:</strong> ${text}</li>`;
      })
      .join("")
    : "<li style=\"margin-bottom:12px;\">Thanks for checking in. Your responses are noted with care.</li>";

  const resourcesHtml = resources.length
    ? resources
      .map((item) => {
        const title = item.title ? escapeHtml(item.title) : "Resource";
        const link = item.link ? escapeHtml(item.link) : "";
        const linkHtml = link ? ` <a href="${link}" style="color:#3d7a6f;">Learn more</a>` : "";
        return `<li style="margin-bottom:10px;">${title}.${linkHtml}</li>`;
      })
      .join("")
    : "<li style=\"margin-bottom:10px;\">No resources were selected, but you can always revisit your results.</li>";

  const html = `
    <div style="font-family: 'Cormorant Garamond', 'Times New Roman', serif; color:#1c1c2e; line-height:1.6;">
      <h2 style="margin:0 0 12px;">Your bright check-in summary</h2>
      <p style="margin:0 0 18px;">Risk level: <strong>${escapeHtml(riskLabel)}</strong></p>
      <h3 style="margin:0 0 8px;">What we noticed</h3>
      <ul style="padding-left:20px; margin:0 0 18px;">${observationsHtml}</ul>
      <h3 style="margin:0 0 8px;">Recommended resources</h3>
      <ul style="padding-left:20px; margin:0;">${resourcesHtml}</ul>
      <p style="margin:18px 0 0; color:#6f757c; font-size:14px;">
        You can revisit your results any time from the bright check-in.
      </p>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "bright <onboarding@resend.dev>",
      to: ["sakethm@unc.edu"],
      subject: "Your bright check-in summary",
      html,
    }),
  });

  const resendBody = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    return new Response(JSON.stringify({ error: "Email send failed.", details: resendBody }), {
      status: 502,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: true, data: resendBody }), { headers: corsHeaders });
});
