import {User} from "../../models/userSchema.js"
import { Otp } from "../../models/otpModels.js";
import bcrypt from "bcrypt"
import randomString from "randomstring"



const signupPage = async(req,res)=>{
    try {
        res.render('user/signup')
    } catch (error) {
        res.status(500).send("Server error")
    } 
}

const signup = async(req,res)=>{
  try {
    const{name,email,password,phone,cPassword} = req.body
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

    
    // Generate and save OTP
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email, otp });
    console.log(result);
    
    let hashedPassword = await bcrypt.hash(password,10)

    //new user

     
     req.session.userDetails = {name,email,password:hashedPassword,phone}
    
    res.render('user/otpVerification',{email})
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({success:false,error:error.message})
    
  }
}


const verifyOtp = async (req,res)=>{
  try {    
    const{otps,email} = req.body
    const otpRecord = await Otp.findOne({email}) 
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP has expired or is invalid." });
    }
    if(otpRecord.otp!=otps){
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    const users = req.session.userDetails
    const newUser = new User(users);
    await newUser.save()
    req.session.user = newUser._id
    console.log(typeof users,"otp side")
    return res.status(200).json({ success: true, message: "OTP verified successfully.", redirectUrl: "/" });  // Example redirect URL
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"An error occured"})
  }
 

}

const resendOtp = async(req,res)=>{
  try {
    const{email} = req.body
    const otp =  randomString.generate({ length: 6, charset: "numeric" });
    const existingOtp = await Otp.findOneAndUpdate({email},{otp},{upsert:true,new:true})
    if(existingOtp){
      await Otp.updateOne({email},{otp})
    }else{
      await Otp.create({email,otp})
    }
    
    res.json({ success: true, message: 'OTP sent successfully!' });

  } catch (error) {
    console.error('Error while resending OTP:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
}

//error page

const loadError = async(req,res)=>{
  try {
      res.render('user/pageNotFound')
  } catch (error) {
      console.log(error)
      res.status(500).send("Server error")
  }
}


//login page
const loginpage = async(req,res)=>{
  try {
    if(req.session.user){
      res.redirect('/')
    }else{
      res.render('user/login')
    }
  } catch (error) {
    res.redirect('/pageNotFound')
  }
  
}

const login = async(req,res)=>{
  const{email,password} = req.body
  console.log(password);
  
  try {
    let savedUser = await User.findOne({isAdmin:0,email})
    //already exist user
    if(!savedUser){
      return res.render("user/login",{message:"User not found"})
    }
    //if user is blocked by admin

    if(savedUser.isBlocked){
      return res.render('user/login',{message:"The user is blocked by admin"})
    }
   
    const matchPassword = await bcrypt.compare(password,savedUser.password)
    
     if(!matchPassword){
      return res.render('user/login',{message:"Incorrect password"})
     }
     req.session.user = savedUser._id
     res.redirect('/')
  } catch (error) {
    console.log(error);
    
  }
}
export {signup,signupPage,verifyOtp,resendOtp,loginpage,login,loadError}

