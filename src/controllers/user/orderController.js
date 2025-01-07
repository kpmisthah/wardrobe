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
        const { productId } = req.body;  // This is actually the item._id

        // Find the order containing this specific item._id
        const order = await Order.findOne({
            'orderedItems._id': productId
        });

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
        //items that want to be removed stored here .it has size and quantity so compare it with our size schema
        const itemToRemove = order.orderedItems[itemIndex];

        //so now we want to increase the stock count for specific product
        const size = await Size.findOne({product:itemToRemove.product,size:itemToRemove.size})
        size.quantity+=itemToRemove.quantity
        await size.save()

        // Remove the item
        order.orderedItems.splice(itemIndex, 1);
        if (order.orderedItems.length === 0) {
            await Order.deleteOne({ _id: order._id });  // Delete the order
            return res.status(200).json({ message: "Order is empty and has been deleted" });
        }

        // Update total price
        order.totalPrice -= itemToRemove.price * itemToRemove.quantity;

        await order.save();
        return res.status(200).json({ message: "Item removed successfully" });

    } catch (error) {
        console.log("Error in productCancel:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const returnOrder = async(req,res)=> {
    try {
        const{productId} = req.body
        const orders = await Order.findOne({'orderedItems._id':productId})
        const orderedIndex= orders.orderedItems.findIndex((item)=>item._id.toString()==productId)
        if(orderedIndex == -1){
            return res.status(401).json({message:"Item not found"})
        }
        const returnOrder = orders.orderedItems[orderedIndex]
        if(returnOrder.returnStatus !== 'Not Requested'){
            return res.status(400).json({ message: 'Return already requested for this product' });
        }
  
        returnOrder.returnStatus = 'Requested'
        await orders.save()
        res.status(200).json({ message: 'Return request submitted successfully'});
    } catch (error) {
        console.log("the error is"+error)
    }
}

// const emptyOrder = async(req,res)=>{
//     try {
//         return res.render('user/emptyOrder')
//     } catch (error) {
//         console.log(error)
//     }
// }
export{orders,viewOrder,productCancel,returnOrder}