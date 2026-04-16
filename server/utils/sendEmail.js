const nodemailer = require("nodemailer");

/**
 * General-purpose email sender (password resets, notifications, etc.)
 * Cloud-optimized: no connection pooling, generous timeouts, retry logic.
 */
const sendEmail = async (options, maxRetries = 3) => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration missing (EMAIL_USERNAME or EMAIL_PASSWORD). Please check environment variables.");
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME || "Learn App"}" <${process.env.FROM_EMAIL || process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments,
  };

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: "gmail",
        pool: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] ✅ Sent to ${options.email} on attempt ${attempt}:`, info.messageId);
      return info;
    } catch (err) {
      lastError = err;
      console.error(`[Email] ❌ Attempt ${attempt}/${maxRetries} failed:`, err.message);

      // Auth errors won't resolve with retries
      if (err.code === 'EAUTH') {
        throw err;
      }

      if (attempt < maxRetries) {
        const backoff = attempt * 2000;
        await new Promise((r) => setTimeout(r, backoff));
      }
    } finally {
      if (transporter) {
        try { transporter.close(); } catch (_) { /* ignore */ }
      }
    }
  }

  throw lastError;
};

module.exports = sendEmail;
