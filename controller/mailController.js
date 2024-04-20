const nodemailer = require('nodemailer');

const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const smtpTransport = nodemailer.createTransport({
  host: SMTP_SERVICE,
  port: SMTP_PORT,
  secure: true, 
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD
  }
});

exports.sendMail = async (to, subject, body) => {
  console.log("SendMail", { to, subject, body });
  try {
    const mailOptions = {
      from: "ReturnPal",
      to,
      subject,
      html: body
    }
    console.log({ mailOptions })
    await smtpTransport.sendMail(mailOptions);
    console.log("SendMail success");
  } catch (err) {
    console.log("SendMail error", { err })
    throw new Error("Error occurred while sending email");
  } 
}
