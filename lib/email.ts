import { Resend } from 'resend'

// Client Resend — la clé API vit dans .env.local uniquement, jamais exposée côté client
const resend = new Resend(process.env.RESEND_API_KEY)

// Adresse expéditeur
// En production : le domaine musae.io doit être vérifié dans le dashboard Resend
//   (Settings → Domains → Add Domain → vérification TXT/DKIM)
// En développement : utilise l'adresse test Resend pour ne pas bloquer les envois
const FROM =
  process.env.NODE_ENV === 'production'
    ? 'Musae <noreply@musae.io>'
    : 'Musae <onboarding@resend.dev>'

// ─── Tokens design (alignés avec index.html et Musae-App) ──────────────────
const C = {
  ink: '#1a1714',
  cream: '#faf8f4',
  gold: '#b8903c',
  parchment: '#f7f3ed',
  inkSoft: '#3d3830',
} as const

// ─── Enveloppe HTML partagée ────────────────────────────────────────────────
// Structure table pour compatibilité maximale avec les clients mail
function enveloppe(contenu: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:${C.cream};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:${C.cream};padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;
                        letter-spacing:0.22em;text-transform:uppercase;color:${C.ink};">
                MU<span style="color:${C.gold};">S</span>AE
              </p>
            </td>
          </tr>

          <!-- Séparateur doré -->
          <tr>
            <td style="padding:0 0 40px;">
              <hr style="border:none;border-top:1px solid rgba(184,144,60,0.4);margin:0;">
            </td>
          </tr>

          <!-- Contenu variable -->
          <tr>
            <td>${contenu}</td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding:40px 0 0;border-top:1px solid rgba(26,23,20,0.08);">
              <p style="margin:0;font-family:Georgia,serif;font-size:12px;
                        color:rgba(26,23,20,0.4);text-align:center;line-height:2;">
                Musae · L'assistant invisible des auteurs<br>
                <a href="https://www.musae.io" style="color:${C.gold};text-decoration:none;">www.musae.io</a>
                &nbsp;·&nbsp;
                <a href="mailto:contact@musae.io" style="color:${C.gold};text-decoration:none;">contact@musae.io</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Bouton CTA réutilisable
function bouton(texte: string, href: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:${C.ink};">
          <a href="${href}"
             style="display:block;padding:14px 36px;color:${C.cream};text-decoration:none;
                    font-family:Georgia,serif;font-size:13px;letter-spacing:0.12em;
                    text-transform:uppercase;">
            ${texte}
          </a>
        </td>
      </tr>
    </table>`
}

// ─── Email 1 : Bienvenue (envoyé après inscription) ────────────────────────
export async function envoyerEmailBienvenue(options: {
  email: string
  prenom: string
}) {
  const contenu = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;
              letter-spacing:0.18em;text-transform:uppercase;color:${C.gold};">
      Bienvenue
    </p>
    <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:30px;font-weight:400;
               color:${C.ink};line-height:1.3;">
      Votre espace est prêt,<br>${options.prenom}.
    </h1>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Votre essai gratuit de 14 jours commence aujourd'hui. Explorez Musae
      à votre rythme, sans engagement, sans carte bancaire.
    </p>
    <p style="margin:0 0 36px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Pour commencer, déposez un extrait de votre livre ou un texte que vous aimez —
      Musae s'occupe du reste.
    </p>
    ${bouton('Accéder à mon espace', 'https://app.musae.io/dashboard')}
    <p style="margin:32px 0 0;font-family:Georgia,serif;font-size:14px;
              color:rgba(26,23,20,0.5);line-height:1.9;font-style:italic;">
      Une question ? Répondez simplement à cet email — nous lisons chaque message.
    </p>
  `

  return resend.emails.send({
    from: FROM,
    to: options.email,
    subject: `Bienvenue sur Musae, ${options.prenom}`,
    html: enveloppe(contenu),
  })
}

// ─── Email 2 : Confirmation d'adresse email ────────────────────────────────
// Connexion : configurer Supabase Auth Hooks pour appeler /api/email/confirm
// (Supabase Dashboard → Auth → Hooks → Send Email)
export async function envoyerEmailConfirmation(options: {
  email: string
  prenom: string
  lienConfirmation: string
}) {
  const contenu = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;
              letter-spacing:0.18em;text-transform:uppercase;color:${C.gold};">
      Confirmation
    </p>
    <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:30px;font-weight:400;
               color:${C.ink};line-height:1.3;">
      Confirmez votre adresse,<br>${options.prenom}.
    </h1>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Il reste une étape avant d'accéder à votre espace Musae :
      confirmer que cette adresse vous appartient.
    </p>
    <p style="margin:0 0 36px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Ce lien est valable pendant 24 heures.
    </p>
    ${bouton('Confirmer mon adresse', options.lienConfirmation)}
    <p style="margin:32px 0 0;font-family:Georgia,serif;font-size:13px;
              color:rgba(26,23,20,0.4);line-height:1.9;">
      Si vous n'avez pas créé de compte Musae, ignorez simplement cet email.
    </p>
  `

  return resend.emails.send({
    from: FROM,
    to: options.email,
    subject: 'Confirmez votre adresse Musae',
    html: enveloppe(contenu),
  })
}

// ─── Email 3 : Réinitialisation du mot de passe ───────────────────────────
// Connexion : configurer Supabase Auth Hooks pour appeler /api/email/reset
// (Supabase Dashboard → Auth → Hooks → Send Email)
export async function envoyerEmailResetPassword(options: {
  email: string
  prenom: string
  lienReset: string
}) {
  const contenu = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;
              letter-spacing:0.18em;text-transform:uppercase;color:${C.gold};">
      Sécurité
    </p>
    <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:30px;font-weight:400;
               color:${C.ink};line-height:1.3;">
      Réinitialisation<br>de votre mot de passe.
    </h1>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Bonjour ${options.prenom},
    </p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Nous avons reçu une demande de réinitialisation pour votre compte Musae.
      Cliquez ci-dessous pour choisir un nouveau mot de passe.
    </p>
    <p style="margin:0 0 36px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Ce lien est valable pendant 1 heure.
    </p>
    ${bouton('Choisir un nouveau mot de passe', options.lienReset)}
    <p style="margin:32px 0 0;font-family:Georgia,serif;font-size:13px;
              color:rgba(26,23,20,0.4);line-height:1.9;">
      Si vous n'avez pas demandé cette réinitialisation, votre compte est en sécurité —
      ignorez simplement cet email.
    </p>
  `

  return resend.emails.send({
    from: FROM,
    to: options.email,
    subject: 'Réinitialisation de votre mot de passe Musae',
    html: enveloppe(contenu),
  })
}

// ─── Email 4 : Confirmation d'abonnement Stripe ───────────────────────────
// Connexion : déclenché depuis app/api/stripe/webhook/route.ts
// sur l'événement customer.subscription.created (plan actif uniquement)
export async function envoyerEmailConfirmationAbonnement(options: {
  email: string
  prenom: string
}) {
  const contenu = `
    <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;
              letter-spacing:0.18em;text-transform:uppercase;color:${C.gold};">
      Abonnement confirmé
    </p>
    <h1 style="margin:0 0 28px;font-family:Georgia,serif;font-size:30px;font-weight:400;
               color:${C.ink};line-height:1.3;">
      Votre abonnement est actif,<br>${options.prenom}.
    </h1>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Merci de faire confiance à Musae pour accompagner votre plume sur les réseaux.
      Votre abonnement est maintenant actif et se renouvelle automatiquement chaque mois.
    </p>
    <p style="margin:0 0 36px;font-family:Georgia,serif;font-size:16px;
              color:${C.inkSoft};line-height:1.9;">
      Vous pouvez gérer ou annuler votre abonnement à tout moment depuis votre espace.
    </p>
    ${bouton('Accéder à mon espace', 'https://app.musae.io/dashboard')}

    <!-- Récapitulatif -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-top:36px;background:${C.parchment};
                  border-left:2px solid rgba(184,144,60,0.5);">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;font-weight:bold;
                    color:${C.ink};letter-spacing:0.1em;text-transform:uppercase;">
            Récapitulatif
          </p>
          <p style="margin:0;font-family:Georgia,serif;font-size:14px;
                    color:${C.inkSoft};line-height:2;">
            Plan Musae · 20 € / mois<br>
            Renouvellement automatique · Annulable à tout moment
          </p>
        </td>
      </tr>
    </table>
  `

  return resend.emails.send({
    from: FROM,
    to: options.email,
    subject: 'Votre abonnement Musae est actif',
    html: enveloppe(contenu),
  })
}
