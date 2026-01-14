import { Cart } from "../../models/cartSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
import { Wishlist } from "../../models/wishlistSchema.js";


const loadWishlist = async(req,res)=>{
    try {
        const user = req.session.user
        const wishlist = await Wishlist.findOne({userId:user}).populate('items.product')
       if(user){
        let userData = await User.findOne({_id:user})
        return res.render('user/wishlist',{wishlist,user:userData})
       }else{
        return res.redirect('/login')
       }
        
        
    } catch (error) {
        
    }
}

const addToWishlist = async(req,res)=>{
    try {
        const user = req.session.user
        const{productId,size,quantity} = req.body
        let wishlist = await Wishlist.findOne({userId:user})
        if(!wishlist){
            wishlist = new Wishlist({userId:user,items:[]})
        }
        const items = wishlist.items.some((item)=>item.product == productId && item.size == size && item.quantity == 1)
        if (quantity > 1) {
            return res.status(400).json({
                message: "Only one quantity of a product can be added to the wishlist"
            });
        }
        if(!items){
            wishlist.items.push({
                product:productId,
                size,
                quantity
            })     
        }else{
            return res.status(400).json({message:"product is already exist"})
        }
        await wishlist.save()
        return res.status(200).json({message:"product addedd to wishlist"})
    } catch (error) {
        console.log("The error is "+error)
    }
}

const wishlistToCart = async(req,res)=>{
    try {
        const userId = req.session.user
        console.log(userId);
        
        const{productId,productName,productSize,productPrice} = req.body
        console.log("prodcut id +++"+productId);
        console.log("prodcut name==="+productName);
        console.log("prodcut size----"+productSize);
        console.log("price==================="+productPrice);
        
        console.log();
        
        
        
        
        
        const cart = await Cart.findOne({userId})
        console.log("The wish cart"+cart);
        
        const wishlist = await Wishlist.findOne({userId})
        console.log("wish"+wishlist);
        
        if(!cart){
            cart = new Cart({userId,items:[],bill:0})
        }
        const cartIndex =  cart.items.findIndex((item)=>item.product.toString()==productId && item.size == productSize)
        if(cartIndex != -1){
            return res.status(400).json({message:"product is already in cart"})
        }else{
            const newItem = {
                product: productId,
                name: productName,
                quantity: 1,
                size: productSize,
                price: Number(productPrice),
                totalPrice: Number(productPrice)
            };
            cart.items.push(newItem)
        }
        cart.bill += Number(productPrice);
        console.log("The bill si"+cart.bill)
        await cart.save()
        return res.status(200).json({message:"Product is added to cart successfully"})
    } catch (error) {
        console.log("erorr is "+error);
        
    }
}

const removeWishlist = async(req,res)=>{
    try {
        const userId = req.session.user
        const {productId} = req.params
        console.log("The aprams is"+productId)
        const wishlist = await Wishlist.findOneAndUpdate({userId},{$pull:{items:{_id:productId}}})
        console.log("The wishlsit is"+wishlist);
        
        if(!wishlist){
            return res.status(404).json({message:"wishlist not found"})
        }
        return res.status(200).json({message:"wishlist deleted successfully"})
       
    } catch (error) {
        
    }
}
export{loadWishlist,addToWishlist,wishlistToCart,removeWishlist}