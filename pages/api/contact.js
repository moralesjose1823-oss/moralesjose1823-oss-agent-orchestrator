// Contact form handler.
// By default this validates input and logs the submission server-side.
// To actually deliver messages, wire this up to an email provider
// (e.g. Resend, SendGrid, Postmark) or a webhook using env vars.

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Please provide your name, email, and a message." });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
  if (!emailOk) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  // Submission received. Replace this with real delivery when ready.
  console.log("New contact submission:", {
    name,
    email,
    company: company || "(none)",
    message,
    at: new Date().toISOString(),
  });

  return res.status(200).json({ ok: true });
}
