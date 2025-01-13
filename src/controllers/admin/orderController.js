import { Order } from "../../models/orderIdSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"
import { Size } from "../../models/sizeSchema.js"
const orderList = async(req,res)=>{
    try {
        let page = parseInt(req.query.page)||1
        let limit = 4
        const orders = await Order.find().populate('userId').skip((page-1)*limit).limit(limit)
        const count = await Order.find().countDocuments()
        const totalpages = Math.ceil(count/limit)
        return res.render('admin/order',{orders,currentPage:page,totalpages})
    } catch (error) {
        
    }
}

const orderStatus = async(req,res)=>{
    try {
        const{status,orderId} = req.body
        const orders = await Order.find()
        console.log("The orders is "+orders)
        const order = await Order.findOneAndUpdate({orderId},{status:status},{new:true})
        console.log("the order updated is"+order)
        if(order){
            res.status(200).json({message:"Order is updated successfully"})
        }else{
            res.status(401).json({message:"order is not updated"})
        }
        
    } catch (error) {
        console.log("The error is"+error);
        
    }
}
const viewOrders = async(req,res)=>{
    try {
        const{orderid} = req.params
        console.log("The orderId"+orderid)
        const order = await Order.findOne({_id:orderid}).populate('orderedItems.product')
         return res.render('admin/viewOrder',{order})
       
        
    } catch (error) {
        console.log(error)
    }
}
const handleReturn = async (req, res) => {
    try {
        const { orderId, productId, action } = req.body;

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const productIndex = order.orderedItems.findIndex(
            (item) => item._id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in order' });
        }

        const productItem = order.orderedItems[productIndex];

        if (action === 'approve') {
            productItem.returnStatus = 'Approved';

            order.totalPrice -= productItem.price * productItem.quantity;
        } else if (action === 'reject') {

            productItem.returnStatus = 'Rejected';
        } else {
            return res.status(400).json({ error: 'Invalid action provided' });
        }

        // Save the updated order
        await order.save();

        return res.status(200).json({ 
            success: true, 
            message: `Return ${action}d successfully`, 
            order 
        });
    } catch (error) {
        console.error("Error in handleReturn:", error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const orderCancelled = async(req,res)=>{
     try {
            const { orderId,productId} = req.body;  
    
            const orderedProducts = await Order.findOne({orderId})
    
            // Find the specific item using its _id
            const itemIndex = orderedProducts.orderedItems.findIndex(
                item => item._id.toString() === productId
            );
    
            if (itemIndex === -1) {
                return res.status(404).json({ message: "Item not found" });
            }
    
            //items that want to be removed stored here .it has size and quantity so compare it with our size schema
            const items = orderedProducts.orderedItems[itemIndex];
    
            //so now we want to increase the stock count for specific product
             items.cancelStatus = 'canceled'
            if(items.cancelStatus == 'canceled'){
                const size = await Size.findOne({product:items.product,size:items.size})
                size.quantity+=items.quantity
                await size.save()
            }
            const allItemsCancelled = orderedProducts.orderedItems.every(
                item => item.cancelStatus === 'canceled'
            );
    
            // If all items are cancelled, update the main order status
            if (allItemsCancelled) {
                orderedProducts.status = 'Canceled';
            }
            // Update total price
            orderedProducts.totalPrice -= items.price * items.quantity;
    
            await orderedProducts.save();
           
            return res.status(200).json({ message: "Item canceled successfully" });
    
        } catch (error) {
            console.log("Error in productCancel:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }
}

export{orderList,orderStatus,handleReturn,orderCancelled,viewOrders}