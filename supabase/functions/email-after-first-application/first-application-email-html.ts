/** Edit this HTML to change the first-application email body. */
export function buildFirstApplicationEmailHtml(options: {
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
    <title>Your first application on ApplyJet</title>
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
                Congratulations, ${escapeHtml(name)}
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                You just created your first application on ApplyJet. That may sound small, but it is not. It is a real step forward, and we are genuinely proud of you for taking it.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                Welcome to this next part of your journey. Job searching can feel slow and lonely. Creating that first application is often the hardest part, because it means you chose hope over waiting. We hope ApplyJet helps you feel a little more productive, organized, and in control as you keep going.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                From here, you can keep building: tailor a resume for the role, write a cover letter that fits, and track what you have sent without losing your place. We want applying to feel lighter than staring at a blank document for hours.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                And please remember: if you ever get stuck, confused, or just want a human on the other side, we are here. Write us anytime at
                <a href="mailto:support@applyjetai.com" style="color:#5b6cff;text-decoration:none;font-weight:600;">support@applyjetai.com</a>.
                We mean that.
              </td>
            </tr>
            <tr>
              <td style="${paragraph}">
                Thank you again for trusting us with something this personal. We are rooting for you, quietly and sincerely, every step of the way.
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <a href="https://applyjetai.com/applications" style="display:inline-block;background:#5b6cff;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:10px;">
                  Open your applications
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

export function buildFirstApplicationEmailText(options: {
  email: string
  displayName?: string | null
}): string {
  const name = options.displayName?.trim() || "there"
  return [
    `Congratulations, ${name}`,
    "",
    "You just created your first application on ApplyJet. That may sound small, but it is not. It is a real step forward, and we are genuinely proud of you for taking it.",
    "",
    "Welcome to this next part of your journey. Job searching can feel slow and lonely. Creating that first application is often the hardest part, because it means you chose hope over waiting. We hope ApplyJet helps you feel a little more productive, organized, and in control as you keep going.",
    "",
    "From here, you can keep building: tailor a resume for the role, write a cover letter that fits, and track what you have sent without losing your place. We want applying to feel lighter than staring at a blank document for hours.",
    "",
    "And please remember: if you ever get stuck, confused, or just want a human on the other side, we are here. Write us anytime at support@applyjetai.com. We mean that.",
    "",
    "Thank you again for trusting us with something this personal. We are rooting for you, quietly and sincerely, every step of the way.",
    "",
    "Open your applications: https://applyjetai.com/applications",
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
