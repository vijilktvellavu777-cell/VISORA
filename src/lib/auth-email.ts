function appOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset your VISORA password";
  const text = `Use this link to reset your VISORA password (expires in one hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<p>Use this link to reset your VISORA password (expires in one hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const from = process.env.VISORA_EMAIL_FROM ?? "VISORA <onboarding@resend.dev>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to send reset email (${response.status}): ${body}`);
    }
    return;
  }

  console.info(`[visora] Password reset email for ${to}: ${resetUrl}`);
}

export function buildPasswordResetUrl(token: string) {
  return `${appOrigin()}/login/reset?token=${encodeURIComponent(token)}`;
}
