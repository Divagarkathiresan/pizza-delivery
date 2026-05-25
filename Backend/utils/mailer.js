const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, text, html) => {
  const transport = await initializeTransporter();
  const message = {
    from: process.env.EMAIL_FROM || 'Pizza Delivery <no-reply@pizza-delivery.local>',
    to,
    subject,
    text,
    html
  };

  const info = await transport.sendMail(message);
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`Email sent to ${to}: ${subject}`);
  } else {
    console.log('Ethereal email preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};

module.exports = { sendEmail };
