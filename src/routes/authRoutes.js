import express from "express"
import  { signup,signupPage,verifyOtp } from '../controllers/user/authController.js'
import {passport} from "../db/passport.js"
const router = express.Router()

router.get('/signup',signupPage)
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})
router.post('/signup',signup)
router.post('/verify-otp',verifyOtp)
export default router