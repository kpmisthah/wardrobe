import { Order } from "../../models/orderIdSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
import moment from "moment";

const loadDashboard = async(req,res)=>{
    try {
        let totalUsers = await User.countDocuments()
        let totalProducts = await Product.countDocuments()
        let totalOrders = await Order.countDocuments()
        const Sales = await Order.aggregate([
            {$match:{status:'Delivered'}},
            {$group:
                {_id:null,totalSales:
                    {$sum:{$cond:
                        [{$eq:['$discount',0]},"$totalPrice","$finalAmount"]}
            }}}
        ])
        const totalSales = Sales.length>0?Sales[0].totalSales:0

        const orders = await Order.find({})
        res.render('admin/dashboard', { totalOrders, totalUsers, totalProducts, totalSales, orders });
    } catch (error) {
        console.log("The error is"+error);
        
    }
}
const dashboard = async(req,res)=>{
    try {
       const{quickFilter,startDate,endDate} = req.body
       let matchCondition = {status:"Delivered"}
       if(quickFilter){
        const now = new Date()
        switch(quickFilter){
            case 'today':
                matchCondition.invoiceDate = {
                    $gte:moment(now).startOf('day').toDate(),
                    $lte:moment(now).endOf('day').toDate()
                }
                break;
                case 'week':
                    matchCondition.invoiceDate = {
                        $gte:moment(now).startOf('isoWeek').toDate(),
                        $lte:moment(now).endOf('isoWeek').toDate()
                    }
                    break;
                    case 'month':
                        matchCondition.invoiceDate = {
                            $gte:moment(now).startOf('month').toDate(),
                            $lte:moment(now).endOf('month').toDate()
                        }
                        break;
                        case 'year':
                            matchCondition.invoiceDate = {
                                $gte: moment(now).startOf('year').toDate(),
                                $lt: moment(now).endOf('year').toDate()
                            };
                            break;
                            default:
                                break;
        }
       }else if(startDate && endDate){
        matchCondition.invoiceDate = {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
        };
       }
        let totalUsers = await User.countDocuments()
        let totalProducts = await Product.countDocuments()
        let totalOrders = await Order.countDocuments()
        const Sales = await Order.aggregate([
            {$match:{status:'Delivered'}},
            {$group:
                {_id:null,totalSales:
                    {$sum:{$cond:
                        [{$eq:['$discount',0]},"$totalPrice","$finalAmount"]}
            }}}
        ])
        const totalSales = Sales.length>0?Sales[0].totalSales:0

        const orders = await Order.find(matchCondition)
        console.log("The orders"+orders)
        res.json({ totalOrders, totalUsers, totalProducts, totalSales, orders });

    } catch (error) {
        console.log("The eror is"+error);
        
    }
    
}
export{dashboard,loadDashboard}