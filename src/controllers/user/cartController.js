import { User } from "../../models/userSchema.js"
import { Cart } from "../../models/cartSchema.js"
import { Size } from "../../models/sizeSchema.js"
// const loadCart = async(req,res)=>{
//     try {
//         let userId = req.session.user
//         let cart = await Cart.findOne({userId}).populate('items.product')
//         if(cart && cart.items.length>0){
//             const userData = await User.findOne({_id:userId})
//             return res.render('user/cart',{user:userData,cart})
//         }else{
//             return res.status(400).json({message:"Cart is empty"})
//         }
       
//     } catch (error) {
//         console.log("the error is"+error)
//         return res.redirect('/notfound')
//     }
// }
const loadCart = async(req,res)=>{
    try {
        let userId = req.session.user
        // Properly populate the product details
        let cart = await Cart.findOne({userId})
            .populate({
                path: 'items.product',
                select: 'name productImage price description'  // Include needed fields
            });

        if(cart && cart.items.length>0){
            const userData = await User.findOne({_id:userId})
            console.log("Cart data:", JSON.stringify(cart, null, 2)); // Debug log
            return res.render('user/cart',{user:userData,cart})
        }else{
            // Instead of sending JSON, render an empty cart page
            return res.render('user/cart', {
                user: await User.findOne({_id:userId}),
                cart: { items: [], bill: 0 }
            });
        }
       
    } catch (error) {
        console.log("the error is"+error);
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
       let itemIndex = cart.items.findIndex((item)=>item.product.toString() == productId && item.size ==size)

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
        cart.items[itemIndex].totalPrice = price*totalQuantity
       }else{
            cart.items.push({
            product:productId,
            name,
            quantity:stock,
            size:size,
            price,
            totalPrice:price*requestedQuantity
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
const deleteItem = async (req, res) => {
    try {
        const user = req.session.user;
        console.log('Session user:', req.session.user);

        const productId = req.params.productId;

        // Find the cart
        const cart = await Cart.findOne({ userId: user });

        if (!cart) {
            return res.status(404).json({ success: false, error: 'Cart not found' });
        }

        // Find the index of the item to be deleted
        const itemIndex = cart.items.findIndex((item) => item._id.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found in cart' });
        }

        // Extract size and quantity from the item 
        const itemToDelete = cart.items[itemIndex];
        const { size, quantity, product } = itemToDelete;

        // Update the stock in the Size schema
        const productSize = await Size.findOne({ product, size });

        if (productSize) {
            productSize.quantity += quantity;
            await productSize.save();
        } else {
            console.warn(`Size entry not found for product: ${product}, size: ${size}`);
        }

        // Remove the item 
        cart.items.splice(itemIndex, 1);

        // Recalculate the total bill
        cart.bill = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        await cart.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false, error: 'Failed to remove item' });
    }
};


export{loadCart,cart,deleteItem}