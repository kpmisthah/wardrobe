import { Wishlist } from "../../models/wishlistSchema.js"

const loadWishlist = async(req,res)=>{
    try {
        return res.render('user/wishlist')
    } catch (error) {
        
    }
}

const addToWishlist = async(req,res)=>{
    try {
        const user = req.session.user
        const {productId} = req.body
        const wishlist = await Wishlist.findOne({userId:user})
        if(!wishlist){
            wishlist = new Wishlist({userId:user,items:[]})
        }
    } catch (error) {
        
    }
}
export{loadWishlist,addToWishlist}