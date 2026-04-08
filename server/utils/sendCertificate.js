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

const sendCertificateEmail = async (user, course, certificateId) => {
  let transporter;
  try {
    const pdfBuffer = await generateCertificateAttachment(user, course, certificateId);
    
    // Use explicit SMTP config (more reliable on cloud hosts than 'service: gmail')
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "Learn App"}" <${process.env.FROM_EMAIL || process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: `🏆 Your Certificate: ${course.title}`,
      text: `Congratulations ${user.name}! You've successfully completed ${course.title}. Please find your certificate attached.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #4F46E5;">Congratulations, ${user.name}! 🎓</h2>
          <p>You have successfully completed <b>${course.title}</b> on LearnEarn.</p>
          <p>We are proud to award you this certificate as a testament to your hard work and dedication.</p>
          <div style="margin: 32px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #4F46E5;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Certificate ID:</p>
            <p style="margin: 4px 0 0 0; font-family: monospace; font-weight: bold; color: #1e293b;">${certificateId}</p>
          </div>
          <p style="font-size: 14px; color: #64748b;">Your certificate is attached as a PDF to this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent with ❤️ from LearnEarn</p>
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

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error in sendCertificateEmail:", err);
    // Log more details if it's an SMTP error
    if (err.code === 'EAUTH') {
      console.error("Authentication failed. Please check EMAIL_USERNAME and EMAIL_PASSWORD.");
    } else if (err.code === 'ESOCKET') {
      console.error("Network/Socket error. This often happens if the host blocks SMTP ports.");
    }
    throw err; 
  } finally {
    if (transporter) transporter.close();
  }
};

module.exports = {
  sendCertificateEmail
};
