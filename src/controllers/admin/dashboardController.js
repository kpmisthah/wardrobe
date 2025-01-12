import { Order } from "../../models/orderIdSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
import moment from "moment";
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

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
        const discount = await Order.aggregate([
            {$match:{status:'Delivered'}},
            {$group:
                {_id:null,discount:
                    {$sum:'$discount'}
                }
            }
        ])
        const totalDiscount = discount.length>0?discount[0].discount:0
        const orders = await Order.find({})
        res.render('admin/dashboard', { totalOrders, totalUsers, totalProducts, totalSales,totalDiscount, orders });
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

const generatePdfReport = async (req,res)=>{
    try {
        const orders = await Order.find({status:"Delivered"})
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        doc.pipe(res);
        doc.fontSize(25).text('Sales Report',{align:'center'})
        doc.moveDown()
        orders.forEach(order=>{
            doc.fontSize(12).text(`Order ID: ${order._id}`);
            doc.text(`Date: ${new Date(order.invoiceDate).toLocaleDateString('en-US')}`);
            doc.text(`Amount: ₹${order.totalPrice}`);
            doc.text(`Discount: ₹${order.discount}`);
            doc.text(`Coupon: ${order.coupon || '-'}`);
            doc.text(`Final Amount: ₹${order.finalAmount || order.totalPrice}`);
            doc.text(`Status: ${order.status}`);
            doc.moveDown();
        })
        doc.end()
    } catch (error) {
        console.log("The error is"+error);
        
    }
}

const generateExcelReport = async (req, res) => {
    const orders = await Order.find({ status: 'Delivered' });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Discount', key: 'discount', width: 15 },
        { header: 'Coupon', key: 'coupon', width: 15 },
        { header: 'Final Amount', key: 'finalAmount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
    ];

    orders.forEach(order => {
        worksheet.addRow({
            orderId: order._id,
            date: new Date(order.invoiceDate).toLocaleDateString('en-US'),
            amount: order.totalPrice,
            discount: order.discount,
            coupon: order.coupon || '-',
            finalAmount: order.finalAmount || order.totalPrice,
            status: order.status,
        });
    });

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + 'sales_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
};
export{dashboard,loadDashboard,generatePdfReport,generateExcelReport}