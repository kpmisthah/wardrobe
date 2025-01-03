import express from "express"
import  { signup,signupPage,verifyOtp,resendOtp,loginpage,login,loadError,logout } from '../controllers/user/authController.js'
import {passport} from "../db/passport.js"
import {userLogin } from "../middlewares/userAuth.js"
const router = express.Router()
//signup

router.get('/signup',userLogin,signupPage)
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
router.get('/login',userLogin,loginpage)
router.post('/login',login)
//logout
router.get('/logout',logout)
export default router