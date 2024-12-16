import {User} from "../../models/userSchema.js"
import { Otp } from "../../models/otpModels.js";
import bcrypt from "bcrypt"
import randomString from "randomstring"


const signupPage = async(req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        res.status(500).send("Server error")
    } 
}

const signup = async(req,res)=>{
  try {
    const{name,email,password,cPassword} = req.body
    if(!name || !email || !password){
      return res.status(403).json({
        success:"false",
        message:"All Fields are required"
      })
    }
    if(password != cPassword){
      res.redirect('signup',{message:"Password not match"})
    }
    //check the user is already exist
    const existUser =await User.findOne({email})
    if(existUser){
     return res.redirect('signup')
    }
    let hashedPassword = await bcrypt.hash(password,10)

    //new user

    const newUser = new User({name,email,password:hashedPassword})
    const val = await newUser.save()
    console.log(val);
    
    // Generate and save OTP
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email, otp });
    console.log(result);

    //store the data in session
    req.session.userOtp = otp
    req.session.userData = {email,password}
    
    res.render('otpVerification')
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({success:false,error:error.message})
    
  }
}


const verifyOtp = async (req,res)=>{
  try {    
    const{otps} = req.body
    if(otps == req.session.userOtp){
       res.json({success:true,redirectUrl:'/'})  
    }else{
      res.status(400).json({success:false,message:"something went wrong"})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"An error occured"})
  }


}
export {signup,signupPage,verifyOtp}

