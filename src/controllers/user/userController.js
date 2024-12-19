import {User} from "../../models/userSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

const loadHome = async(req,res)=>{
    try {
        //check the user is in session and send the data into front-end so we can display the user name 
        //if the user is login if not we can display the signup and login
        let user = req.session.user
        if(user){
            let userData = await User.findOne({_id:user})
            console.log("type of user._id "+typeof user._id)
            console.log("The user data is "+userData);
            
            res.render('user/home',{user:userData})
        }else{
            return res.render('user/home')
        }
         
    } catch (error) {
        console.log(error);
        res.status(500).send("server error")
    }
}

const loadError = async(req,res)=>{
    try {
        res.render('pageNotFound')
    } catch (error) {
        console.log(error)
        res.status(500).send("Server error")
    }
}

export {loadHome,loadError}