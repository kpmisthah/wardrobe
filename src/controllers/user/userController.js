import {User} from "../../models/userSchema.js"
import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { Brand } from "../../models/brandSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

const loadHome = async(req,res)=>{
    try {
        //check the user is in session and send the data into front-end so we can display the user name 
        //if the user is login if not we can display the signup and login
        const category = await Category.find({isListed:true})
        const product = await Product.find(
            {isBlocked:false,category:{$in:category.map(category=>category._id)},quantity:{$gt:0}}
        ).sort({createdAt:-1}).limit(4)
        console.log("The product is "+product)
        
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

const loadShoppingPage =  async(req,res)=>{
    try {

            let user = req.session.user
            let userData = await User.find({_id:user})
            console.log("The data is "+userData)
            let page = parseInt(req.query.page || "1");
            console.log("The page is");
            
            let limit = 4
            const category = await Category.find({isListed:true})
            let categoryIds = category.map((cat) => cat._id);
            console.log("hyy")
            let products =await Product.find(
                {
                    isBlocked:false,category:{$in:categoryIds},quantity:{$gt:0}
                },
            ).sort({createdAt:-1}).skip((page-1)*limit).limit(limit)
            // console.log("The product is "+products)
            const count =await Product.countDocuments({isBlocked:false,category:{$in:category.map(category=>category._id)}})
            const totalpage = Math.ceil(count/limit)

            const brand = await Brand.find({isBlocked:false})
            const categoriesId = category.map((cat) => ({ name: cat.name, _id: cat._id }));
            res.render('user/shop',{userData,categoriesId,products,totalpage,brand})
            
    } catch (error) {
        console.log(error)
    }
}
export {loadHome,loadError,loadShoppingPage}
