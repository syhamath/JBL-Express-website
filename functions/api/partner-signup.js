export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { businessName, firstName, lastName, phone, category } = data;

    if (!businessName || !firstName || !lastName || !phone || !category) {
      return new Response(JSON.stringify({ ok: false, error: "Champs requis manquants." }), { status: 400 });
    }

    const notifyTo = env.NOTIFY_EMAIL || "support@jibiliexpress.app";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "Jibili Express <onboarding@jibiliexpress.app>",
        to: [notifyTo],
        subject: `Nouvelle inscription partenaire — ${businessName}`,
        text:
          `Nouvelle demande d'inscription partenaire:\n\n` +
          `Établissement: ${businessName}\n` +
          `Type d'activité: ${category}\n` +
          `Prénom: ${firstName}\n` +
          `Nom: ${lastName}\n` +
          `Téléphone: ${phone}\n`
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
