import {User} from "../../models/userSchema.js"
import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

const loadHome = async(req,res)=>{
    try {
        //check the user is in session and send the data into front-end so we can display the user name 
        //if the user is login if not we can display the signup and login
        const category = await Category.find({isListed:true})
        const product = await Product.find(
            {isBlocked:false,category:{$in:category.map(category=>category._id)},quantity:{$gt:0}}
        ).sort({createdAt:-1}).limit(4)
        
       let user = req.session.user
        if(user){
            let userData = await User.findOne({_id:user})
            res.render('user/home',{user:userData,product})
        }else{
            return res.render('user/home',{product})
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