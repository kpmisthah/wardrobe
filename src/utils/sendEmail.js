import nodeMailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const sendEmail = async (email, title, otp) => {
  try {
    // Create a Transporter to send emails
    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
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
    console.error("Email sending failed:", error.message);
    // We to not throw the error, so the app continues running (showing OTP in console)
  }

};

export { sendEmail }