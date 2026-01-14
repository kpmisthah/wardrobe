// import { Cart } from "../models/cartSchema.js";
// import { Wishlist}from '../models/wishlistSchema.js'
// const getCartCount = async(userId)=>{
//     try {
//         const cart = await Cart.findOne({userId})
//         return cart? cart.items.reduce((acc,curr)=>acc+curr.quantity,0):0;
//     } catch (error) {
//         console.log("Error getting cart count:",error);
//         return 0;
//     }
// }

// export const cartCountMiddleware = async(req,res,next)=>{
//     if(req.session.user){
//         res.locals.cartItemCount = await getCartCount(req.session.user)
//     }else{
//         res.locals.cartItemCount = 0
//     }
//     next()
// }

// const getWishlistCount = async(userId)=>{
//     try {
//         const wishlist = await Wishlist.findOne({userId})
//         return wishlist? wishlist.items.reduce((acc,curr)=>acc+curr.quantity,0):0
//     } catch (error) {
//         console.log("Error getting cart count:",error);
//         return 0;
//     }
// }

// export const wishlistCountMiddleware = async(req,res,next)=>{
//     if(req.session.user){
//         res.locals.wishlistItemCount = await getWishlistCount(req.session.user)
//     }else{
//         res.locals.wishlistItemCount = 0
//     }
//     next()
    
// }