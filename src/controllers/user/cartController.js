import { User } from "../../models/userSchema.js"
import { Cart } from "../../models/cartSchema.js"
import { Size } from "../../models/sizeSchema.js"
const loadCart = async(req,res)=>{
    try {
        let userId = req.session.user
        let cart = await Cart.findOne({userId}).populate('items.product')
        if(cart && cart.items.length>0){
            const userData = await User.findOne({_id:userId})
            res.locals.user = userData
            res.locals.cart = cart
            return res.render('user/cart',{user:userData,cart})
        }else{
            return res.status(400).json({message:"Cart is empty"})
        }
       
    } catch (error) {
        console.log("the error is"+error)
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

       let cart = await Cart.findOne({userId:owner})
       let maxQtyPerPerson = 10
       if(!cart){
        cart = new Cart({userId:user,items:[],maxQtyPerPerson,bill:0})
       }
       
       //find the item in cart
       let itemIndex = cart.items.findIndex((item)=>item.product.toString() == productId.toString() && item.size ==size)

       let requestedQuantity = parseInt(stock)
       let existingQuantity = itemIndex!=-1?cart.items[itemIndex].quantity:0
       const totalQuantity = requestedQuantity+existingQuantity
       if(totalQuantity>maxQtyPerPerson){
        return res.status(400).json({
            message: `Cannot add more than 10 units per person.`
        })
       }
       if(requestedQuantity>productSize.quantity){
        return res.status(400).json({ message: `Not enough stock.`,stockLeft:productSize.quantity})
       }

       //update cart item
       if(itemIndex != -1){
        cart.items[itemIndex].quantity = totalQuantity
       }else{
            cart.items.push({
            product:productId,
            name,
            quantity:stock,
            size:size,
            price,
            totalPrice:price*stock
            })
       }
       //change the quantity of stock in size schema
       productSize.quantity -=requestedQuantity
       if(productSize.quantity<0){
        return res.status(400).json({message:`Not enough stock`})
       }
       await productSize.save()

        cart.bill = cart.items.reduce((acc,curr)=>acc+(curr.quantity*curr.price),0)
        await cart.save()
        res.status(200).json({message:"Item added to the cart successfully"})
    } catch (error) {
        console.log('Error in addToCart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export{loadCart,cart}