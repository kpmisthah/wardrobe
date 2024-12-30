import { Category } from "../../models/categoriesSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"

let productDetails = async(req,res)=>{
    try {
        const userId = req.session.user
        //findById return a single document.while find() return an array of documents
        const userData = await User.find({_id:userId})
        console.log("The user data is"+userData)
            const productId = req.query.id
            //here i use so many methods all failed last populate helped us
            const products = await Product.find({_id:productId}).populate('category')
            res.render('user/productDetails',{
                products
            })
         
    
        }catch (error) {
        console.log("the error is "+error)
    }

}

export{productDetails}