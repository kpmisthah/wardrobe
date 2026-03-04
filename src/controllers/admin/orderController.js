import { Order } from "../../models/orderIdSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"
import { Size } from "../../models/sizeSchema.js"
import { Wallet } from "../../models/walletSchema.js"
const orderList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1
        let limit = 4
        let search = req.query.search || "";

        let query = {};
        if (search) {
            query = {
                $or: [
                    { orderId: { $regex: search, $options: "i" } },
                    { paymentMethod: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } }
                ]
            };
        }

        const orders = await Order.find(query).populate('userId').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
        console.log("the user is ", orders);

        const count = await Order.find(query).countDocuments()
        const totalpages = Math.ceil(count / limit)
        return res.render('admin/order', { orders, currentPage: page, totalpages, search })
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('An error occurred while fetching orders.');
    }
}

const orderStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body
        const currentOrder = await Order.findOne({ orderId });

        if (!currentOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (currentOrder.status === 'Canceled' || currentOrder.status === 'Returned') {
            return res.status(400).json({ message: `Cannot change status. Order is already ${currentOrder.status}.` });
        }

        currentOrder.status = status;
        await currentOrder.save();

        res.status(200).json({ message: "Order is updated successfully" })

    } catch (error) {
        console.log("The error is" + error);

    }
}
const viewOrders = async (req, res) => {
    try {
        const { orderid } = req.params
        const order = await Order.findOne({ _id: orderid }).populate('orderedItems.product')
        return res.render('admin/viewOrder', { order })


    } catch (error) {
        console.log(error)
    }
}
const handleReturn = async (req, res) => {
    try {
        const userId = req.session.user;
        const { orderId, productId, action } = req.body;

        // Find order and wallet
        const order = await Order.findOne({ orderId });
        const wallet = await Wallet.findOne({ userId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Find the specific product in the order
        const productItem = order.orderedItems.find(
            item => item._id.toString() === productId
        );

        if (!productItem) {
            return res.status(404).json({ error: 'Product not found in order' });
        }

        if (action === 'approve') {
            // Calculate refund amount with discount consideration
            const itemTotal = productItem.price * productItem.quantity;
            const currentTotalPrice = order.totalPrice;
            const currentDiscount = order.discount || 0;

            // Proportional discount for this item
            let proportionalDiscount = 0;
            if (currentTotalPrice > 0 && currentDiscount > 0) {
                proportionalDiscount = (itemTotal / currentTotalPrice) * currentDiscount;
            }

            const refundAmount = itemTotal - proportionalDiscount;

            // Update product status
            productItem.returnStatus = 'Approved';

            // Update wallet balance
            wallet.balance += refundAmount;

            // Add transaction to history
            wallet.transactionHistory.push({
                transactionType: 'refund',
                transactionAmount: Math.round(refundAmount * 100) / 100,
                transactionDate: new Date(),
                description: `Refund for returned item from order ${orderId}`
            });

            // Update order fields
            order.totalPrice -= itemTotal;
            order.discount -= proportionalDiscount;
            order.finalAmount -= refundAmount;

            // Safety clamps
            if (order.totalPrice < 0) order.totalPrice = 0;
            if (order.discount < 0) order.discount = 0;
            if (order.finalAmount < 0) order.finalAmount = 0;

            // Save both wallet and order
            await Promise.all([
                wallet.save(),
                order.save()
            ]);

        } else if (action === 'reject') {
            productItem.returnStatus = 'Rejected';
            await order.save();
        } else {
            return res.status(400).json({ error: 'Invalid action provided' });
        }

        return res.status(200).json({
            success: true,
            message: `Return ${action}d successfully`,
            order,
            walletBalance: action === 'approve' ? wallet.balance : undefined
        });

    } catch (error) {
        console.error("Error in handleReturn:", error);
        return res.status(500).json({
            error: 'Something went wrong',
            details: error.message
        });
    }
};
const orderCancelled = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        const orderedProducts = await Order.findOne({ orderId })

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
        if (items.cancelStatus == 'canceled') {
            const size = await Size.findOne({ product: items.product, size: items.size })
            size.quantity += items.quantity
            await size.save()
        }
        const allItemsCancelled = orderedProducts.orderedItems.every(
            item => item.cancelStatus === 'canceled'
        );

        // If all items are cancelled, update the main order status
        if (allItemsCancelled) {
            orderedProducts.status = 'Canceled';
        }
        // Calculate refund/deduction with discount consideration
        const itemTotal = items.price * items.quantity;
        const currentTotalPrice = orderedProducts.totalPrice;
        const currentDiscount = orderedProducts.discount || 0;

        // Proportional discount for this item
        let proportionalDiscount = 0;
        if (currentTotalPrice > 0 && currentDiscount > 0) {
            proportionalDiscount = (itemTotal / currentTotalPrice) * currentDiscount;
        }

        const refundAmount = itemTotal - proportionalDiscount;

        // Update Order Fields
        orderedProducts.totalPrice -= itemTotal;
        orderedProducts.discount -= proportionalDiscount;
        orderedProducts.finalAmount -= refundAmount;

        // Safety clamps
        if (orderedProducts.totalPrice < 0) orderedProducts.totalPrice = 0;
        if (orderedProducts.discount < 0) orderedProducts.discount = 0;
        if (orderedProducts.finalAmount < 0) orderedProducts.finalAmount = 0;

        await orderedProducts.save();

        return res.status(200).json({ message: "Item canceled successfully" });

    } catch (error) {
        console.log("Error in productCancel:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}

export { orderList, orderStatus, handleReturn, orderCancelled, viewOrders }