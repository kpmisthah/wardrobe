import {User} from "../../models/userSchema.js"
import { Otp } from "../../models/otpModels.js";
import bcrypt from "bcrypt"
import randomString from "randomstring"



const signupPage = async(req,res)=>{
    try {
        return res.render('user/signup')
    } catch (error) {
        return res.status(500).send("Server error")
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
      return res.redirect('signup',{message:"Password not match"})
    }
    //check the user is already exist
    const existUser =await User.findOne({email})
    if(existUser){
     return res.redirect('/signup')
    }

    
    // Generate and save OTP
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email, otp });
    console.log("The otp generated"+result);
    
    let hashedPassword = await bcrypt.hash(password,10)

    //new user

     
     req.session.userDetails = {name,email,password:hashedPassword,phone}
    
    return res.render('user/otpVerification',{email})
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
    // return res.redirect("/")
    return res.status(200).json({ success: true, message: "OTP verified successfully.", redirectUrl: "/" });  // Example redirect URL
  } catch (error) {
    console.log(error);
    return res.status(500).json({success:false,message:"An error occured"})
  }
 

}

const resendOtp = async(req,res)=>{
  try {
    const{email} = req.body
    const otp =  randomString.generate({ length: 6, charset: "numeric" });
    const existingOtp = await Otp.findOneAndUpdate({email},{otp},{upsert:true,new:true})
    console.log("The otp is "+ existingOtp)
    // if(existingOtp){
    //   await Otp.updateOne({email},{otp})
    // }else{
    //   await Otp.create({email,otp})
    // }
    
    return res.json({ success: true, message: 'OTP sent successfully!' });

  } catch (error) {
    console.error('Error while resending OTP:', error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
}

//error page

const loadError = async(req,res)=>{
  try {
      return res.render('user/pageNotFound')
  } catch (error) {
      console.log(error)
     return res.status(500).send("Server error")
  }
}


//login page
const loginpage = async(req,res)=>{
  try {
    
      return res.render('user/login',{message:''})
    
  } catch (error) {
   return res.redirect('/pageNotFound')
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
   
    const matchPassword =  await bcrypt.compare(password,savedUser.password)
    
     if(!matchPassword){
      return res.render('user/login',{message:"Incorrect password"})
     }
     req.session.user = savedUser._id
     return res.redirect('/')
  } catch (error) {
    console.log(error);
    return res.render('user/login',{message:"An error occur during login"})
  }
}

const forgotPassword = async(req,res)=>{
  try {
    return res.render('user/forgot-password')
  } catch (error) {
    console.log(error)
  }
}

const handleForgotPassword = async(req,res)=>{
  try {
    const{email} = req.body
    const user = await User.findOne({email})
    console.log("The user is "+user)
    if (!user) {
      return res.status(404).json({success: false,message: "No account found with this email"});
    }
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const result = await Otp.create({ email:user.email, otp });
    console.log("The result of otp  is "+result)
      // Store email in session
      req.session.email = email;
    return res.status(200).json({message:"Otp is created"})

  } catch (error) {
    console.log(error)
  }
}

const otpVerified= async(req,res)=>{
  try {
    const email = req.session.email
    return res.render('user/otp-page',{email})
  } catch (error) {
    
  }
}


const verify = async (req,res)=>{
  try {    
    const{otps} = req.body 
    const email = req.session.email
    const otpRecord = await Otp.findOne({email}) 
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP has expired or is invalid." });
    }
    if(otpRecord.otp!=otps){
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

  
    // return res.redirect("/")
    return res.status(200).json({ success: true, message: "OTP verified successfully.", redirectUrl: "/reset-password" });  // Example redirect URL
  } catch (error) {
    console.log(error);
    return res.status(500).json({success:false,message:"An error occured"})
  }
 

}

const resetPassword = async(req,res)=>{
  try {
    return res.render('user/reset-password')
  } catch (error) {
    console.log(error)
  }
}
const postNewPassword = async(req,res)=>{
  try {
    const{ password, confirmPassword} = req.body
    const email = req.session.email
    if(password == confirmPassword){
      const hashedPassword = await bcrypt.hash(password,10)
      await User.updateOne({email:email},{$set:{password:hashedPassword}})
      return res.status(200).json({message:"password changed successfully"})
    }else{
      return res.status(400).json({ message: "Passwords do not match" });
    }

  } catch (error) {
    console.log("The error"+error)
  }
}
const logout = (req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        console.log("Session destroyed")
      }
    })
    return res.redirect('/login')
  } catch (error) {
    console.log("The error is"+error)
  }
}

export {signup,signupPage,verifyOtp,resendOtp,loginpage,login,loadError,logout,forgotPassword,handleForgotPassword,otpVerified,verify,resetPassword,postNewPassword}

