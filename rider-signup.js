export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { firstName, lastName, phone, vehicleType, email } = data;

    if (!firstName || !lastName || !phone || !vehicleType) {
      return new Response(JSON.stringify({ ok: false, error: "Champs requis manquants." }), { status: 400 });
    }

    const notifyTo = env.NOTIFY_EMAIL || "contact@jibiliexpress.com";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "Jibili Express <onboarding@resend.dev>",
        to: [notifyTo],
        subject: `Nouvelle inscription livreur — ${firstName} ${lastName}`,
        text:
          `Nouvelle demande d'inscription livreur:\n\n` +
          `Prénom: ${firstName}\n` +
          `Nom: ${lastName}\n` +
          `Téléphone: ${phone}\n` +
          `Véhicule: ${vehicleType}\n` +
          `Email: ${email || "(non fourni)"}\n`
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
