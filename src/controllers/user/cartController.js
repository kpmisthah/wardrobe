import { User } from "../../models/userSchema.js"
import { Cart } from "../../models/cartSchema.js"
import { Size } from "../../models/sizeSchema.js"
const loadCart = async(req,res)=>{
    try {
        let user = req.session.user
        let userData = await User.findOne({_id:user})
        if(cart && cart.items.length>0){
            return res.render('user/cart',{user:userData})
        }else{
            return res.status(400).json({message:"Cart is empty"})
        }
       
    } catch (error) {
        return res.redirect('/notfound')
    }
}

const cart = async(req,res)=>{
    try {
        const owner = req.session.user
        const user = await User.findOne({_id:owner})
        //this got from cart.js
        const {productId,name,price,stock,size}= req.body
        //check the stock of the product and user enter stock 
       const productSize = await Size.findOne({product:productId,size})
       let stockLeft = productSize.quantity - parseInt(stock)
       console.log("The stock left is "+stockLeft)
        productSize.quantity = stockLeft
       await productSize.save()
       if(productSize.quantity<parseInt(stock)){
        return res.status(400).json({message:`Not enough stock for size`,stockLeft:productSize.quantity})
       }
       let cart = await Cart.findOne({userId:owner})
       let maxQtyPerPerson = 10
       if(!cart){
        cart = new Cart({userId:user,items:[],maxQtyPerPerson,bill:0})
       }
       
       //find the item in cart
       const itemIndex = cart.items.findIndex((item)=>item.product.toString() == productId.toString() && item.size ==size)
        if(itemIndex != -1){
            //check new quantity with max quantity
            const newQuantity = cart.items[itemIndex].quantity+parseInt(stock)

            if(newQuantity>maxQtyPerPerson){
                return res.status(400).json({message:`Cannot add more than maximum quantity units of size  to your cart`})
            }
            //add the quantity
            cart.items[itemIndex].quantity = newQuantity
            if(cart.items.quantity<productSize.quantity){
                return res.status(400).json({message:`Not enough stock for size ${size}`})
            }
        }else{
            cart.items.push({
                product:productId,
                name,
                quantity:stock,
                size:size,
                price
            })
        }
        //calculate bill
        cart.bill = cart.items.reduce((acc,curr)=>acc+(curr.quantity*curr.price),0)
        await cart.save()
        res.status(200).json({message:"Item added to the cart successfully"})
    } catch (error) {
        console.log('Error in addToCart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export{loadCart,cart}