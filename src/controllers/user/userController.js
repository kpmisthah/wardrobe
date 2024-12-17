import {User} from "../../models/userSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

const loadHome = async(req,res)=>{
    try {
        //check the user is in session and send the data into front-end so we can display the user name 
        //if the user is login if not we can display the signup and login
        let user = req.session.user
        console.log("User in session: ", user); // Log the entire user object in the session
        console.log("Type of user: ", typeof user); // Log the type of the user object
        if(user){
            console.log("type of user._id up "+typeof user._id)
            console.log("User object keys: ", Object.keys(user)); // Log the keys of the user object to inspect its structure
            console.log("User._id: ", user.name); // Log user._id to understand why it's undefined
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