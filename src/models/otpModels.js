import mongoose,{Schema}from "mongoose"
import { sendEmail } from "../utils/sendEmail.js";
const otpSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
      },
}
)
async function sendVerificationEmail(email, otp) {
  const title = "Verification Email"
    try {
      await sendEmail(
        email,
        title,
        otp
      );
      console.log("Email sent successfully:");
    } catch (error) {
      console.log("Error occurred while sending email: ", error);
      throw error;
    }
  }
  otpSchema.pre("save", async  function(next) {
    console.log("New document saved to the database");
    // Only send an email when a new document is created
    if (this.isNew) {
      await sendVerificationEmail(this.email, this.otp);
    }
    next();
  });
export const Otp = mongoose.model('Otp',otpSchema)