import { Order } from "../../models/orderIdSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
const dashboard = async(req,res)=>{
    try {
        let totalUsers = await User.countDocuments()
        let totalProducts = await Product.countDocuments()
        let totalOrders = await Order.countDocuments()
        const Sales = await Order.aggregate([
            {$match:{status:'Delivered'}},
            {$group:
                {_id:null,totalSales:
                    {$sum:{$cond:
                        [{$eq:['discount',0]},"$finalAmount","$totalPrice"]}
            }}}
        ])
        const totalSales = Sales.length>0?Sales[0].totalSales:0
        res.render('admin/dashboard',{totalOrders,totalUsers,totalProducts,totalSales})
    } catch (error) {
        console.log("The eror is"+error);
        
    }
    
}
export{dashboard}