const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;
  try {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email configuration missing (EMAIL_USERNAME or EMAIL_PASSWORD). Please check environment variables.");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error("Error in sendEmail utility:", err);
    throw err;
  } finally {
    if (transporter) transporter.close();
  }
};

module.exports = sendEmail;
