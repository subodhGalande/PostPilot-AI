interface VerificationEmailProps {
  name: string;
  verifyUrl: string;
}

export function renderVerificationEmailHtml({
  name,
  verifyUrl,
}: VerificationEmailProps): string {
  const cleanName = name?.trim() || "there";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 40px 16px; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #141417; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.6);">
    
    <!-- Top Accent Bar -->
    <tr>
      <td style="height: 4px; background-color: #0047ff;"></td>
    </tr>

    <!-- Email Body -->
    <tr>
      <td style="padding: 28px 32px;">
        <p style="font-size: 16px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
          Hi ${cleanName},
        </p>

        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
          Welcome to <strong style="color: #ffffff;">PostPilot AI</strong>. Please verify your email address to activate your account and claim your daily 10 free AI generation tokens:
        </p>

        <!-- CTA Button -->
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
          <tr>
            <td align="center" style="border-radius: 10px; background-color: #0047ff;">
              <a href="${verifyUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 10px; display: inline-block; border: 1px solid #0047ff;">
                Verify Email Address &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry & Fallback Link -->
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #71717a; margin: 0 0 6px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
            ⏳ LINK EXPIRES IN 15 MINUTES
          </p>
          <p style="font-size: 12px; color: #a1a1aa; margin: 0; word-break: break-all;">
            If the button doesn&apos;t work, copy and paste this URL into your browser:<br>
            <a href="${verifyUrl}" style="color: #0047ff; text-decoration: underline;">${verifyUrl}</a>
          </p>
        </div>

        <p style="font-size: 12px; color: #71717a; margin: 0;">
          If you did not request an account with PostPilot AI, you can safely ignore this message.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 32px; background-color: #09090b; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <p style="font-size: 11px; color: #52525b; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
          &copy; ${new Date().getFullYear()} PostPilot AI. All rights reserved.
        </p>
      </td>
    </tr>

  </table>

</body>
</html>`.trim();
}
