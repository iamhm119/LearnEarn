const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const generateCertificateAttachment = (user, course, certificateId) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // 1. Background Fill (Very light blue/white)
      doc.rect(0, 0, pageWidth, pageHeight).fill("#f4f9ff");

      // 2. Rounded Blue Border
      const margin = 35;
      doc.roundedRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, 20)
         .lineWidth(2)
         .strokeColor("#2563eb")
         .stroke();

      // 3. Logo / Platform Name
      doc.font("Helvetica-Bold")
         .fontSize(34)
         .fillColor("#2563eb")
         .text("LearnEarn", 0, 85, { align: "center" });

      // 4. Subtitle (Customized)
      doc.font("Helvetica")
         .fontSize(12)
         .fillColor("#6b7280")
         .text("Empowering Professional Growth and Excellence", 0, 125, { align: "center" });

      // 5. "Certificate of Completion" Badge
      const badgeWidth = 260;
      const badgeHeight = 36;
      const badgeX = (pageWidth - badgeWidth) / 2;
      const badgeY = 165;
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 18).fill("#2563eb");
      doc.font("Helvetica-Bold")
         .fontSize(14)
         .fillColor("#ffffff")
         .text("Certificate of Completion", 0, badgeY + 11, { align: "center" });

      // 6. "THIS CERTIFIES THAT"
      doc.font("Helvetica-Bold")
         .fontSize(12)
         .fillColor("#9ca3af")
         .text("THIS CERTIFIES THAT", 0, 245, { align: "center" });

      // 7. User Name
      doc.font("Helvetica-Bold")
         .fontSize(46)
         .fillColor("#111827")
         .text(user.name, 0, 275, { align: "center" });

      // 8. "has successfully completed"
      doc.font("Helvetica-Bold")
         .fontSize(16)
         .fillColor("#2563eb")
         .text("has successfully completed", 0, 345, { align: "center" });

      // 9. Course Name
      doc.font("Helvetica-Bold")
         .fontSize(22)
         .fillColor("#2563eb")
         .text(course.title, 0, 385, { align: "center" });

      // 10. Divider Line
      doc.moveTo(80, pageHeight - 130)
         .lineTo(pageWidth - 80, pageHeight - 130)
         .lineWidth(1)
         .strokeColor("#e5e7eb")
         .stroke();

      // 11. Footer details (Date and ID)
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Date info (Left side)
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(dateStr, 120, pageHeight - 100, { width: 150, align: "center" });
      doc.font("Helvetica").fontSize(10).fillColor("#9ca3af").text("Issue Date", 120, pageHeight - 85, { width: 150, align: "center" });

      // Certificate ID info (Right side)
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(certificateId, pageWidth - 420, pageHeight - 100, { align: "center", width: 300 });
      doc.font("Helvetica").fontSize(10).fillColor("#9ca3af").text("Certificate ID", pageWidth - 420, pageHeight - 85, { align: "center", width: 300 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Create a fresh nodemailer transporter with cloud-optimized settings.
 * - pool: false — avoids persistent SMTP connections that Render/cloud hosts may kill
 * - No transporter.verify() — this extra round-trip often times out on cold starts
 * - Generous timeouts — cloud DNS resolution can be slow
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration missing (EMAIL_USERNAME or EMAIL_PASSWORD). Please check environment variables.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    pool: false,           // Don't keep connections alive — avoids ESOCKET on serverless / Render
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,  // Helps in restricted cloud environments
    },
    connectionTimeout: 30000,     // 30 s to establish the TCP connection
    greetingTimeout: 30000,       // 30 s for the SMTP greeting
    socketTimeout: 60000,         // 60 s for socket inactivity
    logger: false,
    debug: false,
  });
};

/**
 * Send the certificate email with automatic retry (up to 3 attempts).
 * Each attempt creates a fresh transporter to avoid stale-connection errors.
 */
const sendCertificateEmail = async (user, course, certificateId, maxRetries = 3) => {
  // Generate the PDF once — it won't change between retries
  const pdfBuffer = await generateCertificateAttachment(user, course, certificateId);

  const mailOptions = {
    from: `"${process.env.FROM_NAME || "Learn App"}" <${process.env.FROM_EMAIL || process.env.EMAIL_USERNAME}>`,
    to: user.email,
    subject: `🏆 Your Certificate: ${course.title}`,
    text: `Congratulations ${user.name}! You've successfully completed ${course.title}. Please find your certificate attached.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px;">🎓 LearnEarn</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">Certificate of Completion</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">Congratulations, ${user.name}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            You have successfully completed <strong style="color: #4F46E5;">${course.title}</strong> on LearnEarn.
          </p>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
            We are proud to award you this certificate as a testament to your hard work and dedication.
          </p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #4F46E5;">
            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Certificate ID</p>
            <p style="margin: 6px 0 0 0; font-family: monospace; font-weight: bold; color: #1e293b; font-size: 14px;">${certificateId}</p>
          </div>
          <p style="font-size: 14px; color: #64748b;">Your certificate is attached as a PDF to this email.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent with ❤️ from LearnEarn Platform</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Certificate_${course.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ],
  };

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let transporter;
    try {
      console.log(`[Email] Attempt ${attempt}/${maxRetries} — sending certificate to ${user.email}`);
      transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] ✅ Sent successfully on attempt ${attempt}:`, info.messageId);
      return info;
    } catch (err) {
      lastError = err;
      console.error(`[Email] ❌ Attempt ${attempt} failed:`, err.message);

      if (err.code === 'EAUTH') {
        console.error("[Email] Authentication failed. Check EMAIL_USERNAME / EMAIL_PASSWORD (must be a Gmail App Password).");
        throw err;  // Auth errors won't resolve with retries
      }

      if (attempt < maxRetries) {
        const backoff = attempt * 2000;  // 2s, 4s
        console.log(`[Email] Retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    } finally {
      if (transporter) {
        try { transporter.close(); } catch (_) { /* ignore close errors */ }
      }
    }
  }

  console.error("[Email] All retry attempts exhausted. Last error:", lastError?.message);
  throw lastError;
};

module.exports = {
  sendCertificateEmail
};
