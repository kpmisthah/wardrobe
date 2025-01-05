import { Order } from "../../models/orderIdSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"
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
        
    }
}

const handleReturn = async(req,res)=>{
    try {
        const {orderId,productId,action} = req.body
        console.log("The order id"+orderId)
        console.log("Product id id"+productId);
        console.log("tHE ACTION IS 0"+action)
        
        const order = await Order.findOne({orderId})
        console.log("The order is"+order)
        const productIndex =  order.orderedItems.findIndex((item)=>item._id.toString()===productId)
       
        console.log("The index is "+productIndex)
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found in order' });
        }
        if(action == 'approve'){
            order.orderedItems[productIndex].returnStatus = 'Approved'
        }else if(action == 'reject'){
            order.orderedItems[productIndex].returnStatus = 'Rejected'
        }

        await order.save()
       return res.status(200).json({ success: true, message: `Return ${action}d successfully` });
    } catch (error) {
        console.log("The error of handleReturn",handleReturn)
    }
}
export{orderList,orderStatus,handleReturn}