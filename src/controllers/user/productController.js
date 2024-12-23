import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { User } from "../../models/userSchema.js"

let productDetails = async(req,res)=>{
    try {
        console.log('hyyy')
        const userId = req.session.user
        //findById return a single document.while find() return an array of documents
        const userData = await User.find({_id:userId})
        console.log("The user data is"+userData)
            const productId = req.query.id
            const products = await Product.find({_id:productId}).populate('category')
            console.log("The product is fine")
            const findCategory = products.category
            const categoryOffer = findCategory?.categoryOffer||0
            const productOffer = products.productOffer||0
            const totalOffer = categoryOffer+productOffer
            res.render('user/productDetails',{
                userData,
                products,
                quantity:products.quantity,
                category:findCategory,
                totalOffer
            })
         
    
        }catch (error) {
        console.log("the error is "+error)
    }

}

export{productDetails}