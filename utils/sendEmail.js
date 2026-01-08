const nodemailer = require("nodemailer");
const {EMAIL_SERVER_HOST,EMAIL_SERVER_USER,EMAIL_SERVER_PASS,EMAIL_SERVER_SENDER} = require('../config/config');


const settings = {
  service: `${EMAIL_SERVER_HOST}`,
  auth: {
    user: `${EMAIL_SERVER_USER}`,
    pass: `${EMAIL_SERVER_PASS}`,
  }
};

exports.sendMail = async (recipient, subject, body, cc) => {
  const transporter = nodemailer.createTransport(settings);

  const mailOptions = {
    from: `I Like File ${EMAIL_SERVER_SENDER}`,
    to: `${recipient}`,
    cc: `${cc}`,
    subject: `${subject}`,
    text: `${body}`,
    html: `${body}`,
  };
  let data = await mail(transporter, mailOptions);
  return data;
};

let mail = async (transporter, mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return resolve({ isSuccess: false, message: `${err.message}` });
      }
      return resolve({ isSuccess: true, message: "Email successfully sent." });
    });
  });
};
