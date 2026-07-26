/** Edit this HTML to change the welcome email body. */
export function buildWelcomeEmailHtml(options: {
  email: string
  displayName?: string | null
}): string {
  const name = options.displayName?.trim() || "there"
  const paragraph =
    "padding:12px 28px 0;font-size:16px;line-height:1.7;color:#4b5563;"

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to ApplyJet AI</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f5f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e4dc;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 28px 12px;font-size:14px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#5b6cff;">
                ApplyJet AI
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;font-size:28px;line-height:1.25;font-weight:600;">
                Welcome, ${escapeHtml(name)}
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                Thank you for giving ApplyJet a little of your time. We know how precious that is right now, and we do not take it lightly.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                Looking for work can feel heavy. You send applications, wait, refresh, and still hear nothing back. It is easy to wonder if something is wrong with you. It usually is not. The job market is crowded, competitive, and often unfairly quiet. If that is part of why you found us, you are in the right place, and you are not alone.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                We also know how many hours people spend rewriting the same resume again and again. Tailoring for each role matters. Recruiters can tell when a resume was written for their posting. That work is worth doing. It just should not cost you your evenings, weekends, and peace of mind.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                That is why we built ApplyJet. Not to promise you the job you want. We cannot make that promise, and we will never pretend we can. What we can promise is to help you build stronger, clearer, role-specific resumes with far less stress, so you can put your energy into showing up as yourself.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                From the bottom of our hearts: thank you for trusting us with something this important. We will keep working to make the hard parts lighter, one tailored resume at a time.
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <a href="https://applyjetai.com/login" style="display:inline-block;background:#5b6cff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:10px;">
                  Start tailoring
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 8px;font-size:15px;line-height:1.6;color:#1a1a2e;font-weight:500;">
                With gratitude,<br />
                The ApplyJet team
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;font-size:13px;line-height:1.5;color:#9ca3af;">
                This email was sent to ${escapeHtml(options.email)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildWelcomeEmailText(options: {
  email: string
  displayName?: string | null
}): string {
  const name = options.displayName?.trim() || "there"
  return [
    `Welcome, ${name}`,
    "",
    "Thank you for giving ApplyJet a little of your time. We know how precious that is right now, and we do not take it lightly.",
    "",
    "Looking for work can feel heavy. You send applications, wait, refresh, and still hear nothing back. It is easy to wonder if something is wrong with you. It usually is not. The job market is crowded, competitive, and often unfairly quiet. If that is part of why you found us, you are in the right place, and you are not alone.",
    "",
    "We also know how many hours people spend rewriting the same resume again and again. Tailoring for each role matters. Recruiters can tell when a resume was written for their posting. That work is worth doing. It just should not cost you your evenings, weekends, and peace of mind.",
    "",
    "That is why we built ApplyJet. Not to promise you the job you want. We cannot make that promise, and we will never pretend we can. What we can promise is to help you build stronger, clearer, role-specific resumes with far less stress, so you can put your energy into showing up as yourself.",
    "",
    "From the bottom of our hearts: thank you for trusting us with something this important. We will keep working to make the hard parts lighter, one tailored resume at a time.",
    "",
    "Start here: https://applyjetai.com/applications",
    "",
    "With gratitude,",
    "The ApplyJet team",
    "",
    `This email was sent to ${options.email}.`,
  ].join("\n")
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
