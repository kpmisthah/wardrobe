import express from "express"
import  { signup,signupPage,verifyOtp,resendOtp,loginpage,login,loadError,logout,forgotPassword ,handleForgotPassword,verify,otpVerified,resetPassword,postNewPassword} from '../controllers/user/authController.js'
import {passport} from "../db/passport.js"
import {userLogin } from "../middlewares/userAuth.js"
import { otpVerification } from "../controllers/user/userController.js"
const router = express.Router()
//signup

router.get('/signup',userLogin,signupPage)
router.post('/signup',signup)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
//google auth
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }),
    (req, res) => {
        // Set the session the same way as regular login
        req.session.user = req.user._id;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/signup');
            }
            res.redirect('/');
        });
    }
);
//forgot password
router.get('/forgot-password',userLogin,forgotPassword)
router.post('/forgot-password',handleForgotPassword)
router.get('/otp-page',userLogin,otpVerified)
router.post('/verified',verify)
router.get('/reset-password',userLogin,resetPassword)
router.post('/reset-password',postNewPassword)
//error
router.get('/pageNotFound',loadError)

//login
router.get('/login',userLogin,loginpage)
router.post('/login',login)
//logout
router.get('/logout',logout)
export default router