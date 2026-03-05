import userRepository from "../../repositories/userRepository.js";
import otpRepository from "../../repositories/otpRepository.js";
import bcrypt from "bcrypt";
import randomString from "randomstring";
import { sendEmail } from "../../utils/sendEmail.js";
import { StatusCodes, ResponseStatus } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

const signupPage = async (req, res) => {
  try {
    return res.render("user/signup");
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, cPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: ResponseStatus.ERROR,
        message: Messages.FIELDS_REQUIRED,
      });
    }
    if (password != cPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: ResponseStatus.ERROR, message: Messages.PASSWORD_MISMATCH });
    }
    //check the user is already exist
    const existUser = await userRepository.findByEmail(email);
    if (existUser) {
      return res.status(StatusCodes.CONFLICT).json({ success: ResponseStatus.ERROR, message: Messages.USER_EXISTS });
    }
    // Generate and save OTP
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await otpRepository.create({ email, otp });
    console.log("THE OTP IS:", otp); // Added for testing
    req.session.userDetails = { name, email, password, phone };
    console.log(
      "The session details: ",
      JSON.stringify(req.session.userDetails, null, 2)
    );

    return res.status(StatusCodes.OK).json({ message: 'redirect to verifiy otp', email: req.session.userDetails.email, redirectUrl: '/verify-otp' })

  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: ResponseStatus.ERROR, error: error.message });
  }
};

const otpPage = async (req, res) => {

  if (req.session.user) {
    return res.redirect('/');
  }
  const { email } = req.session.userDetails || {};
  console.log(email, 'emaillllll=====')
  if (!email) {
    return res.redirect('/signup');
  }
  res.render('user/otpVerification', { email });

}
const verifyOtp = async (req, res) => {
  try {
    const { otps, email } = req.body;


    // Validate input
    if (!email || !otps) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: ResponseStatus.ERROR,
        message: "Invalid request data. OTP or email missing.",
      });
    }

    const otpRecord = await otpRepository.findLatestByEmail(email);

    if (!otpRecord) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: ResponseStatus.ERROR,
        message: Messages.OTP_EXPIRED,
      });
    }

    // Verify OTP matches
    // Verify OTP matches
    if (otpRecord.otp !== otps) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: ResponseStatus.ERROR,
        message: Messages.OTP_INVALID,
      });
    }

    // Get user details from session
    const user = req.session.userDetails;
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: ResponseStatus.ERROR,
        message: "Session expired. Please signup again.",
      });
    }

    // Double check if user was created by a concurrent request
    const existingUser = await userRepository.findByEmail(user.email);
    if (existingUser) {
      req.session.user = existingUser._id;
      delete req.session.userDetails;
      return res.status(StatusCodes.OK).json({
        success: ResponseStatus.SUCCESS,
        message: Messages.OTP_VERIFIED,
        redirectUrl: "/",
      });
    }

    const passwordHash = await bcrypt.hash(user.password, 10)

    // Create new user
    const newUser = await userRepository.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: passwordHash
    });

    // Set session
    req.session.user = newUser._id;
    delete req.session.userDetails; // Important: cleanup


    return res.status(StatusCodes.OK).json({
      success: ResponseStatus.SUCCESS,
      message: Messages.OTP_VERIFIED,
      redirectUrl: "/",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);

    // Send more specific error message
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: ResponseStatus.ERROR,
      message: "An error occurred during verification",
    });
  }
};
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    console.log("THE RESEND OTP IS:", otp);
    console.log("The resend is " + otp);
    const existingOtp = await otpRepository.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );
    await sendEmail(email, "Resend OTP Verification", otp);

    return res.json({ success: ResponseStatus.SUCCESS, message: Messages.OTP_SENT });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        success: ResponseStatus.ERROR,
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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
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
    let savedUser = await userRepository.findOne({ isAdmin: 0, email });

    // User not found
    if (!savedUser) {
      return res.json({
        success: ResponseStatus.ERROR,
        message: Messages.USER_NOT_FOUND,
      });
    }

    // User is blocked
    if (savedUser.isBlocked) {
      return res.json({
        success: ResponseStatus.ERROR,
        message: Messages.ACCOUNT_BLOCKED,
      });
    }

    const matchPassword = await bcrypt.compare(password, savedUser.password);
    if (!matchPassword) {
      return res.json({
        success: ResponseStatus.ERROR,
        message: Messages.INCORRECT_PASSWORD,
      });
    }

    req.session.user = savedUser._id;
    return res.json({
      success: ResponseStatus.SUCCESS,
      message: Messages.LOGIN_SUCCESS,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: ResponseStatus.ERROR,
      message: Messages.LOGIN_ERROR,
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
    const user = await userRepository.findByEmail(email);
    console.log("The user is " + user);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: ResponseStatus.ERROR, message: "No account found with this email" });
    }
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await otpRepository.create({ email: user.email, otp });
    console.log("The result of otp  is " + result);
    // Store email in session
    req.session.email = email;
    sendEmail(email, otp)
    return res.status(StatusCodes.OK).json({ message: Messages.OTP_CREATED });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

const otpVerified = async (req, res) => {
  try {
    const email = req.session.email;
    return res.render("user/otp-page", { email });
  } catch (error) { }
};

const verify = async (req, res) => {
  try {
    const { otps } = req.body;
    const email = req.session.email;
    const otpRecord = await otpRepository.findOne({ email });
    if (!otpRecord) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: ResponseStatus.ERROR, message: Messages.OTP_EXPIRED });
    }
    if (otpRecord.otp != otps) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: ResponseStatus.ERROR, message: Messages.OTP_INVALID });
    }

    // return res.redirect("/")
    return res
      .status(StatusCodes.OK)
      .json({
        success: ResponseStatus.SUCCESS,
        message: Messages.OTP_VERIFIED,
        redirectUrl: "/reset-password",
      }); // Example redirect URL
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: ResponseStatus.ERROR, message: "An error occured" });
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
      await userRepository.updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      );
      return res.status(StatusCodes.OK).json({ message: Messages.PASSWORD_CHANGED });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.PASSWORD_MISMATCH });
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
