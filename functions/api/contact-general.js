export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { name, email, subject, message } = data;
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ ok: false, error: "Champs requis manquants." }), { status: 400 });
    }
    const notifyTo = env.NOTIFY_EMAIL || "support@jibiliexpress.app";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Jibili Express <onboarding@jibiliexpress.app>",
        to: [notifyTo],
        reply_to: email,
        subject: `Question générale — ${subject}`,
        text: `Nouvelle question générale:\n\nNom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}\n`
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, error: "Échec de l'envoi.", detail: errText }), { status: 502 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Requête invalide." }), { status: 400 });
  }
}
