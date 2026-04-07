const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
