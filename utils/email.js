const nodemailer = require('nodemailer');

const sendEMail = async (options) => {
  //1 create a transporter
  const transporter = nodemailer.createTransport({
    //service:'Gmail' for gmail remove host and port
    host: process.env.EMAIL_HOST,
    port: process.env.EMIAL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2-specify message options
  const messageOptions = {
    from: 'Sanket Mishra <mishra7999@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  await transporter.sendMail(messageOptions);
};
module.exports = sendEMail;
