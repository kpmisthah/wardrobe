import mongoose from 'mongoose';
import { Order } from "../../models/orderIdSchema.js"
import { Size } from "../../models/sizeSchema.js"
import { User } from '../../models/userSchema.js';
//load Orders page
const orders = async(req,res)=>{
    try {
        const user = req.session.user
        const orders = await Order.find({userId:user})
        const nonZeroOrders = orders.filter((item)=>item.totalPrice>0)

            return res.render('user/orders',{order:nonZeroOrders})
    
        
       
        
    } catch (error) {
        console.log("The error is"+error)
    }
}

const viewOrder = async(req,res)=>{
    try {
        const user = req.session.user
        const{orderid} = req.params
        console.log("The orderId"+orderid)
        const order = await Order.findOne({_id:orderid}).populate('orderedItems.product')
        if(user){
            const userData = await User.findOne({_id:user})
            return res.render('user/viewOrder',{user:userData,order})
        }
        
    } catch (error) {
        console.log(error)
    }
}

const productCancel = async(req, res) => {
    try {
        const { productId,product } = req.body;  // This is actually the item._id
        console.log("The sieze id is"+product)

        // Find the order containing this specific item._id
        const order = await Order.findOne({
            'orderedItems._id': productId
        });
        console.log("The order is "+order)

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the specific item using its _id
        const itemIndex = order.orderedItems.findIndex(
            item => item._id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Store the item before removal
        const itemToRemove = order.orderedItems[itemIndex];
        console.log("The item to remove"+itemToRemove)

        //so now we want to increase the stock count for specific product
        const size = await Size.findOne({product:itemToRemove.product,size:itemToRemove.size})
        size.quantity+=itemToRemove.quantity
        await size.save()

        console.log("Hello sizeeeee"+size)
        // Remove the item
        order.orderedItems.splice(itemIndex, 1);

        // Update total price
        order.totalPrice -= itemToRemove.price * itemToRemove.quantity;

        if (order.orderedItems.length === 0) {
            await order.save();
            // Instead of rendering, send JSON with redirect info
            return res.status(200).json({ 
                message: "Order is empty",
                redirect: '/emptyOrder'  // Frontend will handle this redirect
            });
        }
        await order.save();
        return res.status(200).json({ message: "Item removed successfully" });

    } catch (error) {
        console.log("Error in productCancel:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const emptyOrder = async(req,res)=>{
    try {
        return res.render('user/emptyOrder')
    } catch (error) {
        console.log(error)
    }
}
export{orders,viewOrder,productCancel,emptyOrder}