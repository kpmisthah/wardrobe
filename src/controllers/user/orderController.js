import { Order } from "../../models/orderIdSchema.js"
import { Size } from "../../models/sizeSchema.js"
import { User } from '../../models/userSchema.js';
import { Wallet } from '../../models/walletSchema.js';
//load Orders page
const orders = async(req,res)=>{
    try {
        const user = req.session.user
        let page = parseInt(req.query.page)||1
        let limit = 10
        const orders = await Order.find({userId:user}).skip((page-1)*limit).limit(limit).populate('orderedItems.product').sort({createdAt:-1});
        let count = await Order.find({userId:user}).countDocuments()
        let totalpages = Math.ceil(count/limit)
        return res.render('user/orders', {orders,page,totalpages}) 
    } catch (error) {
        console.log("The error is"+error)
    }
}

 const viewOrder = async(req,res)=>{
    try {
        const user = req.session.user
        const{orderid} = req.params
        const order = await Order.findOne({_id:orderid}).populate('orderedItems.product')
        if(user){
            const userData = await User.findOne({_id:user})
            return res.render('user/viewOrder',{user:userData,order})
        }
        
    } catch (error) {
        console.log(error)
    }
}

const orderCancel = async(req, res) => {
    try {
        const { orderId,productId} = req.body;  

        // Find the order containing this specific item._id
        const orderedProducts = await Order.findOne({orderId})
        const itemIndex = orderedProducts.orderedItems.findIndex(
            item => item._id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found" });
        }

        const items = orderedProducts.orderedItems[itemIndex];

        //so now we want to increase the stock count for specific product
         items.cancelStatus = 'canceled'
        if(items.cancelStatus == 'canceled'){
            const size = await Size.findOne({product:items.product,size:items.size})
            size.quantity+=items.quantity
            await size.save()
        }
        // Update total price
        orderedProducts.finalAmount -= items.price * items.quantity;
        if(orderedProducts.finalAmount < 0|| orderedProducts.totalPrice <0){
            orderedProducts.finalAmount = 0
            orderedProducts.totalPrice = 0
        }
        if(items.cancelStatus == 'canceled' && orderedProducts.paymentMethod !='COD'){
            const wallet = await Wallet.findOne({userId:orderedProducts.userId})
            const refundAmount = items.price*items.quantity
            if(wallet ){
                wallet.balance+=refundAmount
                wallet.transactionHistory.push({
                    transactionType: 'refund',
                    transactionAmount: refundAmount,
                    description: `Refund for canceled item from order ${orderedProducts._id}`
                });
                await wallet.save();
            }else{
                const newWallet = new Wallet({
                    userId: orderedProducts.userId,
                    balance: refundAmount,
                    transactionHistory: [{
                        transactionType: 'refund',
                        transactionAmount: refundAmount,
                        description: `Refund for canceled item from order ${orderedProducts._id}`
                    }]
                });
                await newWallet.save();
            }
        }
        await orderedProducts.save();
       const allProductsCancelled = orderedProducts.orderedItems.every((p=>p.cancelStatus == 'canceled'))
       if(allProductsCancelled){
        orderedProducts.status = 'Canceled'
        await orderedProducts.save()
       }
        return res.status(200).json({ message: "Item canceled successfully" });

    } catch (error) {
        console.log("Error in productCancel:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const cancelledOrder = await Order.findByIdAndUpdate(orderId, { status: "Canceled" }, { new: true });

        for(let item of cancelledOrder.orderedItems){
                const size = await Size.findOne({product:item.product,size:item.size})
                size.quantity+=item.quantity
                await size.save()
                item.cancelStatus = 'canceled'
        }


        // Refund to wallet if payment method is not COD
        if (cancelledOrder.paymentMethod !== 'COD' && cancelOrder.paymentStatus != 'Pending') {
            const wallet = await Wallet.findOne({ userId: cancelledOrder.userId });
            const refundAmount = cancelledOrder.finalAmount;
            if (wallet) {
                wallet.balance += refundAmount;
                wallet.transactionHistory.push({
                    transactionType: 'refund',
                    transactionAmount: refundAmount,
                    description: `Refund for cancelled order ${cancelledOrder._id}`
                });
                await wallet.save();
            } else {
                const newWallet = new Wallet({
                    userId: cancelledOrder.userId,
                    balance: refundAmount,
                    transactionHistory: [{
                        transactionType: 'refund',
                        transactionAmount: refundAmount,
                        description: `Refund for cancelled order ${cancelledOrder._id}`
                    }]
                });
                await newWallet.save();
            }
        }

        await cancelledOrder.save();
        return res.status(200).json({
            success: true,
            message: "Order canceled successfully"
        });

    } catch (error) {
        console.log("error in " + error);
        return res.status(500).json({ message: "Internal server error" });
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
        if(returnOrder.returnStatus !== 'Not Requested'||returnOrder.cancelStatus == 'canceled'){
            return res.status(400).json({ message: 'Return already requested for this product' });
        }

        returnOrder.returnStatus = 'Requested'

        await orders.save()
        res.status(200).json({ message: 'Return request submitted successfully'});
    } catch (error) {
        console.log("the error is"+error)
    }
}

//whole order return
const returnOrdered = async(req,res)=>{
    try {
        const orderId = req.params.id
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send("Order not found.");
        }
        if (order.status !== "Delivered") {
            return res.status(400).send("Order cannot be returned.");
        }
        order.status = "Returned";
        await order.save();
        // res.redirect('/orders')
    } catch (error) {
        console.error("Error returning order:", err);
        res.status(500).send("Error returning order.");
    }
}
//update order status cancel payment 


const updateOrderStatus = async (req, res) => {
    try {
      const { orderId, status } = req.body;
      
      const order = await Order.findOne({ _id:orderId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.paymentStatus = status;
      await order.save();
  
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  };
  
export{orders,viewOrder,orderCancel,returnOrder,cancelOrder, updateOrderStatus,returnOrdered}