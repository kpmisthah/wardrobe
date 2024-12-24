import express from "express"
import  { signup,signupPage,verifyOtp,resendOtp,loginpage,login,loadError } from '../controllers/user/authController.js'
import {passport} from "../db/passport.js"
const router = express.Router()
//signup

router.get('/signup',signupPage)
router.post('/signup',signup)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
//google auth

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})

//error
router.get('/pageNotFound',loadError)

//login
router.get('/login',loginpage)
router.post('/login',login)
export default router