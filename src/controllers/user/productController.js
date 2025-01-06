import { Category } from "../../models/categoriesSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"

let productDetails = async(req,res)=>{
    try {
       
        //findById return a single document.while find() return an array of documents
        const user = req.session.user
        const userData = await User.find({_id:user})
            const productId = req.query.id
            //here i use so many methods all failed last populate helped us
            const products = await Product.find({_id:productId}).populate('category').populate('sizeOptions')
           if(user){
            return res.render('user/productDetails',{user:userData,products}) 

           }
            
        }catch (error) {
        console.log("the error is "+error)
    }

}

export{productDetails}