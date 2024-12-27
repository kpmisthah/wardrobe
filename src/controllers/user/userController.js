import {User} from "../../models/userSchema.js"
import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { Brand } from "../../models/brandSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

const loadHome = async(req,res)=>{
    try {
    //separate category
         const menCategory = await Category.findOne({name:"Men"})
         console.log("The product is "+menCategory)
         const womenCategory = await Category.findOne({name:"Women"})
         const kidsCategory = await Category.findOne({name:"Kids"})

         const menProducts = await Product.find({ category: menCategory._id ,isBlocked:false}).limit(1);
         console.log("The products rendered is", menProducts);
         const womenProducts = await Product.find({category:womenCategory._id,isBlocked:false}).limit(1)
         const kidsProducts = await Product.find({category:kidsCategory._id,isBlocked:false}).limit(1)

         //product overview

         const product = await Product.find({isBlocked:false}).sort({createdAt:-1}).limit(4)
         let user = req.session.user
         console.log("The session is "+user)
         if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/home',{user:userData,menProducts,womenProducts,kidsProducts,product})
         }
        return res.render('user/home',{menProducts,womenProducts,kidsProducts,product})

    } catch (error) {
       console.log(error);
        return res.status(500).send("server error")
    }
}

const loadError = async(req,res)=>{
    try {
       return res.render('pageNotFound')
    } catch (error) {
        console.log(error)
       return res.status(500).send("Server error")
    }
}

const loadShoppingPage =  async(req,res)=>{
  
    try {
            let page = parseInt(req.query.page ||1);
            let limit = 4
            let products =await Product.find(
                {
                    isBlocked:false
                },
            ).sort({createdAt:-1}).skip((page-1)*limit).limit(limit)
            const count =await Product.countDocuments({isBlocked:false})
            const totalpage = Math.ceil(count/limit)
  
                let userData = await User.findOne({_id:user})
               return res.render('user/shop',{user:userData,categoriesId,products,totalpage})
            }
            
            
     catch (error) {
        console.log(error)
    }

}


export {loadHome,loadError,loadShoppingPage}
