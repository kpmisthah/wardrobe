import { Category } from "../../models/categoriesSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"


let productDetails = async(req,res)=>{
    try {
       
        
        const user = req.session.user
        const userData = await User.find({_id:user})
            const productId = req.query.id
            const products = await Product.find({_id:productId,isBlocked:false}).populate('category').populate('sizeOptions')
            console.log("The products is",products);
            const categoryInProduct = await Product.findOne({_id:productId})
            
            const relatedProducts = await Product.find({
            category:categoryInProduct.category,_id:{$ne:productId},isBlocked:false})
            
           if(user){
            return res.render('user/productDetails',{user:userData,products,relatedProducts}) 

           }
            
        }catch (error) {
        console.log("the error is "+error)
    }

}

export{productDetails}