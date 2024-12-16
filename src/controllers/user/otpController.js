import { signup } from "./authController.js"

// const sendOTP = async(req,res)=>{
//     try {
//         const{email} = req.body
//         // Check if user is already present
//         const checkUserPresent = await User.findOne({ email });
//         if (checkUserPresent) {
//             return res.status(401).json({
//               success: false,
//               message: 'User is already registered',
//             });
//           }
//           function generateOTP() {
//             return randomString.generate({
//                 length: 6,charset: 'numeric'
//             });
//         }
//         let otp = generateOTP()
//         let result = await Otp.findOne({ otp: otp });

//         const otpPayload = { email, otp };
//         const otpBody = await Otp.create(otpPayload);
//         res.status(200).json({
//           success: true,
//           message: 'OTP sent successfully',
//           otp,
//         });
//     } catch (error) {
//         console.log(error.message);
//     return res.status(500).json({ success: false, error: error.message });
//     }
// }
// export{sendOTP}

