import { User } from "../../models/userSchema.js";
import { Otp } from "../../models/otpModels.js";
import bcrypt from "bcrypt";
import randomString from "randomstring";

const signupPage = async (req, res) => {
  try {
    return res.render("user/signup");
  } catch (error) {
    return res.status(500).send("Server error");
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, cPassword } = req.body;
    console.log("name" + name + "email" + email);

    if (!name || !email || !password) {
      return res.status(403).json({
        success: "false",
        message: "All Fields are required",
      });
    }
    if (password != cPassword) {
      return res.redirect("signup", { message: "Password not match" });
    }
    //check the user is already exist
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.redirect("/signup");
    }
    // Generate and save OTP
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email, otp });
    req.session.userDetails = { name, email, password, phone };
    console.log(
      "The session details: ",
      JSON.stringify(req.session.userDetails, null, 2)
    );

    console.log("The otp generated" + result);
    return res.status(200).json({message:'redirect to verifiy otp',email:req.session.userDetails.email,redirectUrl:'/verify-otp'})
    // return res.render("user/otpVerification", {
    //   email: req.session.userDetails.email,
    // });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// const verifyOtp = async (req,res)=>{
//   try {
//     const{otps,email} = req.body
//     if (!email || !otps) {
//       return res.status(400).json({ success: false, message: "Invalid request data. OTP or email missing." });
//   }
//   console.log("Email and OTP received in backend:", email, otps);
//     console.log("otps"+otps+" and"+email);

//     const otpRecord = await Otp.findOne({email})
//     if (!otpRecord) {
//       return res.status(400).json({ success: false, message: "OTP has expired or is invalid." });
//     }
//     if(otpRecord.otp!=otps){
//       return res.status(400).json({ success: false, message: "Invalid OTP." });
//     }
//     const users = req.session.userDetails
//     const newUser = new User(users);
//     await newUser.save()
//     req.session.user = newUser._id
//     console.log(typeof users,"otp side")
//     // return res.redirect("/")
//     return res.status(200).json({ success: true, message: "OTP verified successfully.", redirectUrl: "/" });
//   } catch (error) {
//     console.error("Error in verifyOtp:", error);

//     return res.status(500).json({success:false,message:"An error occured"})
//   }

// }
const otpPage = async(req,res)=>{

    const { email } = req.session.userDetails || {};
    if (!email) {
      return res.redirect('/signup'); 
    }
    res.render('user/otpVerification', { email });
  
}
const verifyOtp = async (req, res) => {
  console.log("hai from verifyotp")
  try {
    const { otps, email } = req.body;

    console.log("Received OTP:", otps);
    console.log("Received Email:", email);
    console.log("Session Details:", req.session.userDetails);

    // Validate input
    if (!email || !otps) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data. OTP or email missing.",
      });
    }

    // Find the most recent OTP record for this email
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    console.log("Found OTP Record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP record not found.",
      });
    }

    // Verify OTP matches
    if (otpRecord.otp !== otps) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Get user details from session
    const user = req.session.userDetails;
    console.log("The user"+user);
    const passwordHash = await bcrypt.hash(user.password,10)

    // Create new user
    const newUser = new User({
      name:user.name,
      email:user.email,
      phone:user.phone,
      password:passwordHash
    });
    await newUser.save();

    // Set session
    req.session.user = newUser._id;


    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      redirectUrl: "/",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);

    // Send more specific error message
    return res.status(500).json({
      success: false,
      message:  "An error occurred during verification",
    });
  }
};
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const existingOtp = await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );
    console.log("The otp is " + existingOtp);
    // if(existingOtp){
    //   await Otp.updateOne({email},{otp})
    // }else{
    //   await Otp.create({email,otp})
    // }

    return res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
};

//error page

const loadError = async (req, res) => {
  try {
    return res.render("user/pageNotFound");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//login page
const loginpage = async (req, res) => {
  try {
    return res.render("user/login", { message: "" });
  } catch (error) {
    return res.redirect("/pageNotFound");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let savedUser = await User.findOne({ isAdmin: 0, email });

    // User not found
    if (!savedUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // User is blocked
    if (savedUser.isBlocked) {
      return res.json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }

    const matchPassword = await bcrypt.compare(password, savedUser.password);
    if (!matchPassword) {
      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    req.session.user = savedUser._id;
    return res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    return res.render("user/forgot-password");
  } catch (error) {
    console.log(error);
  }
};

const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log("The user is " + user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email" });
    }
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email: user.email, otp });
    console.log("The result of otp  is " + result);
    // Store email in session
    req.session.email = email;
    return res.status(200).json({ message: "Otp is created" });
  } catch (error) {
    console.log(error);
  }
};

const otpVerified = async (req, res) => {
  try {
    const email = req.session.email;
    return res.render("user/otp-page", { email });
  } catch (error) {}
};

const verify = async (req, res) => {
  try {
    const { otps } = req.body;
    const email = req.session.email;
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired or is invalid." });
    }
    if (otpRecord.otp != otps) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // return res.redirect("/")
    return res
      .status(200)
      .json({
        success: true,
        message: "OTP verified successfully.",
        redirectUrl: "/reset-password",
      }); // Example redirect URL
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "An error occured" });
  }
};

const resetPassword = async (req, res) => {
  try {
    return res.render("user/reset-password");
  } catch (error) {
    console.log(error);
  }
};
const postNewPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.session.email;
    if (password == confirmPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      );
      return res.status(200).json({ message: "password changed successfully" });
    } else {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  } catch (error) {
    console.log("The error" + error);
  }
};
const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Session destroyed");
      }
    });
    return res.redirect("/login");
  } catch (error) {
    console.log("The error is" + error);
  }
};

export {
  signup,
  signupPage,
  verifyOtp,
  resendOtp,
  loginpage,
  login,
  loadError,
  logout,
  forgotPassword,
  handleForgotPassword,
  otpVerified,
  verify,
  resetPassword,
  postNewPassword,
  otpPage
};
