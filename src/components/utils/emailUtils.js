const nodemailer = require("nodemailer");
const config = require("../../../config/development.json");


const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Elaunch Infotech" <${config.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("SMTP Error:", error);
   
    throw new Error("Email service unavailable");
  }
};

module.exports = { sendEmail };
