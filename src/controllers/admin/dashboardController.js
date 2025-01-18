// dashboardController.js
import moment from 'moment';
import { Order } from '../../models/orderIdSchema.js';

const loadDashboard = async (req, res) => {
    try {
        // Set default filter to current month
        const now = new Date();
        const matchCondition = {
            status: "Delivered",
            invoiceDate: {
                $gte: moment(now).startOf('month').toDate(),
                $lte: moment(now).endOf('month').toDate()
            }
        };

        // Get initial sales data
        const salesData = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } }
                    },
                    totalSales: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Get initial payment method distribution
        const paymentData = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    }
                }
            }
        ]);

        // Calculate summary statistics
        const summary = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: {
                        $avg: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    }
                }
            }
        ]);

        // Format the data for initial render
        const initialData = {
            salesData: salesData.map(item => ({
                date: item._id.date,
                sales: item.totalSales,
                orders: item.orderCount
            })),
            paymentData: paymentData,
            summary: summary[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0
            }
        };

        // Render the dashboard with initial data
        res.render('admin/dashboard', {
            title: 'Sales Analytics Dashboard',
            initialData: JSON.stringify(initialData),
            user: req.session.user,
            moment: moment
        });

    } catch (error) {
        console.error("Dashboard loading error:", error);
        res.status(500).render('error', {
            message: "Error loading dashboard",
            error: error
        });
    }
};

const getSalesAnalytics = async (req, res) => {
    try {
        let { quickFilter, startDate, endDate } = req.body;
        let matchCondition = { status: "Delivered" };

        // Set date range based on filter
        if (quickFilter) {
            const now = new Date();
            switch (quickFilter) {
                case 'today':
                    matchCondition.invoiceDate = {
                        $gte: moment(now).startOf('day').toDate(),
                        $lte: moment(now).endOf('day').toDate()
                    };
                    break;
                case 'week':
                    matchCondition.invoiceDate = {
                        $gte: moment(now).startOf('isoWeek').toDate(),
                        $lte: moment(now).endOf('isoWeek').toDate()
                    };
                    break;
                case 'month':
                    matchCondition.invoiceDate = {
                        $gte: moment(now).startOf('month').toDate(),
                        $lte: moment(now).endOf('month').toDate()
                    };
                    break;
                case 'year':
                    matchCondition.invoiceDate = {
                        $gte: moment(now).startOf('year').toDate(),
                        $lte: moment(now).endOf('year').toDate()
                    };
                    break;
            }
        } else if (startDate && endDate) {
            matchCondition.invoiceDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get daily sales data
        const salesData = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } }
                    },
                    totalSales: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Get payment method distribution
        const paymentData = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 },
                    totalAmount: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    }
                }
            }
        ]);

        // Calculate summary for the filtered period
        const summary = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: {
                        $avg: { $cond: [{ $eq: ['$discount', 0] }, "$totalPrice", "$finalAmount"] }
                    }
                }
            }
        ]);

        res.json({
            salesData: salesData.map(item => ({
                date: item._id.date,
                sales: item.totalSales,
                orders: item.orderCount
            })),
            paymentData: paymentData,
            summary: summary[0] || {
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0
            }
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { loadDashboard, getSalesAnalytics };