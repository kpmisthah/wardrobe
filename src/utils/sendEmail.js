import nodeMailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const sendEmail = async (email,title,otp) => {
    try {
    // Create a Transporter to send emails
    let transporter = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port:process.env.MAIL_PORT,
        secure:false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Ignore certificate issues for development
      },
      });
      // info is an object that provide the information about email delivery
      let info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: title,
        html: `<h1>Please confirm your OTP</h1>
        <p>Here is your OTP code: <strong>${otp}</strong></p>`,
      });
      console.log("Email info: ", info);

    } catch (error) {
      console.log(error.message);
    }

};

export {sendEmail}