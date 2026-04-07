const sendEmail = require("./sendEmail");

/**
 * Sends a beautiful event registration confirmation email.
 * @param {Object} user  - { name, email }
 * @param {Object} event - { title, company, startTime, duration, skills, rewards }
 */
const sendEventRegistrationEmail = async (user, event) => {
  try {
    const startDate = new Date(event.startTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const durationText =
      event.duration >= 60
        ? `${Math.floor(event.duration / 60)}h ${event.duration % 60}min`
        : `${event.duration} minutes`;

    const skillTags = (event.skills || [])
      .map(
        (s) =>
          `<span style="display:inline-block;background:#EEF2FF;color:#4F46E5;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:600;margin:2px;">${s}</span>`
      )
      .join(" ");

    const rewardHTML = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        <span style="background:#FEF9C3;color:#854D0E;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;">⚡ ${event.rewards?.xp || 0} XP</span>
        <span style="background:#FEF9C3;color:#92400E;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;">🪙 ${event.rewards?.coins || 0} Coins</span>
        ${
          event.rewards?.internshipSlots > 0
            ? `<span style="background:#DCFCE7;color:#166534;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;">🏆 Top ${event.topNSelected || 3} get selected!</span>`
            : ""
        }
      </div>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Event Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">🎉</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">You're Registered!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;font-weight:500;">Your spot has been confirmed for a live hiring event</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Hi <strong>${user.name}</strong>,<br/>
                Great news — you've successfully registered for the competitive coding event below. Get ready to showcase your skills!
              </p>

              <!-- Event Card -->
              <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;">Event</p>
                <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#111827;">${event.title}</h2>
                <p style="margin:0 0 16px;font-size:13px;color:#6B7280;font-weight:600;">by ${event.company || "LearnEarn Platform"}</p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 12px;">
                      <span style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">📅 Date &amp; Time</span><br/>
                      <span style="font-size:14px;font-weight:600;color:#111827;">${startDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 12px;">
                      <span style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">⏱️ Duration</span><br/>
                      <span style="font-size:14px;font-weight:600;color:#111827;">${durationText}</span>
                    </td>
                  </tr>
                  ${
                    skillTags
                      ? `<tr>
                    <td style="padding:0 0 12px;">
                      <span style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">🛠️ Skills Tested</span><br/>
                      <div style="margin-top:6px;">${skillTags}</div>
                    </td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td>
                      <span style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;">🏅 Rewards</span>
                      ${rewardHTML}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Tips -->
              <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#4338CA;">💡 Tips for the competition</p>
                <ul style="margin:0;padding-left:18px;color:#4338CA;font-size:13px;line-height:1.7;">
                  <li>Join the event <strong>5 minutes early</strong> to avoid last-minute issues.</li>
                  <li>Do <strong>not switch tabs</strong> — it violates anti-cheat rules.</li>
                  <li>Read each question carefully and manage your time wisely.</li>
                  <li>Top performers may be selected for <strong>internship opportunities</strong>!</li>
                </ul>
              </div>

              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.6;">
                Head to the <strong>Events</strong> page on the platform when the event goes live. The quiz will unlock automatically.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/events"
                       style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                      Go to Events Page →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                This email was sent by <strong style="color:#6B7280;">Learn &amp; Earn Platform</strong><br/>
                You're receiving this because you registered for a live event.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendEmail({
      email: user.email,
      subject: `✅ Registered: ${event.title} — See you there!`,
      html,
      message: `Hi ${user.name}, you have successfully registered for ${event.title}. The event starts on ${startDate} and lasts ${durationText}.`,
    });
  } catch (err) {
    // Non-blocking — log but do not crash
    console.error("sendEventRegistrationEmail error:", err.message);
  }
};

module.exports = sendEventRegistrationEmail;
