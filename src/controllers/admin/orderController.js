import { Order } from "../../models/orderIdSchema.js"
import { Product } from "../../models/productSchema.js"
import { User } from "../../models/userSchema.js"
import { Size } from "../../models/sizeSchema.js"
import { Wallet } from "../../models/walletSchema.js"
import { StatusCodes } from "../../utils/enums.js"
import { Messages } from "../../utils/messages.js"

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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
    }
}

const orderStatus = async (req, res) => {
    try {
        const { status, orderId } = req.body
        const currentOrder = await Order.findOne({ orderId });

        if (!currentOrder) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.ORDER_NOT_FOUND });
        }

        if ((status === 'Shipped' || status === 'Delivered') && currentOrder.paymentStatus !== 'Success' && currentOrder.paymentMethod !== 'COD') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.CANNOT_SHIP_UNPAID });
        }

        currentOrder.status = status;
        await currentOrder.save();

        res.status(StatusCodes.OK).json({ message: Messages.ORDER_UPDATED })

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
        const { orderId, productId, action } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: Messages.ORDER_NOT_FOUND });
        }

        const wallet = await Wallet.findOne({ userId: order.userId });

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: Messages.ORDER_NOT_FOUND });
        }

        const productItem = order.orderedItems.find(
            item => item._id.toString() === productId
        );

        if (!productItem) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: Messages.ITEM_NOT_FOUND });
        }

        if (action === 'approve') {
            const itemTotal = productItem.price * productItem.quantity;
            const currentTotalPrice = order.totalPrice;
            const currentDiscount = order.discount || 0;

            let proportionalDiscount = 0;
            if (currentTotalPrice > 0 && currentDiscount > 0) {
                proportionalDiscount = (itemTotal / currentTotalPrice) * currentDiscount;
            }

            const refundAmount = itemTotal - proportionalDiscount;

            if (order.paymentStatus !== 'Success' && order.paymentMethod !== 'COD') {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.CANNOT_REFUND_UNPAID });
            }

            productItem.returnStatus = 'Approved';

            const size = await Size.findOne({ product: productItem.product, size: productItem.size });
            if (size) {
                size.quantity += productItem.quantity;
                await size.save();
            }

            wallet.balance += refundAmount;

            wallet.transactionHistory.push({
                transactionType: 'refund',
                transactionAmount: Math.round(refundAmount * 100) / 100,
                transactionDate: new Date(),
                description: `Refund for returned item from order ${orderId}`
            });

            order.totalPrice -= itemTotal;
            order.discount -= proportionalDiscount;
            order.finalAmount -= refundAmount;

            if (order.totalPrice < 0) order.totalPrice = 0;
            if (order.discount < 0) order.discount = 0;
            if (order.finalAmount < 0) order.finalAmount = 0;

            await Promise.all([
                wallet.save(),
                order.save()
            ]);

        } else if (action === 'reject') {
            productItem.returnStatus = 'Rejected';
            await order.save();
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.INVALID_ACTION });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Return ${action}d successfully`,
            order,
            walletBalance: action === 'approve' ? wallet.balance : undefined
        });

    } catch (error) {
        console.error("Error in handleReturn:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: Messages.SOMETHING_WENT_WRONG,
            details: error.message
        });
    }
};
const orderCancelled = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        const orderedProducts = await Order.findOne({ orderId })

        const itemIndex = orderedProducts.orderedItems.findIndex(
            item => item._id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.ITEM_NOT_FOUND });
        }

        const items = orderedProducts.orderedItems[itemIndex];

        items.cancelStatus = 'canceled'
        if (items.cancelStatus == 'canceled') {
            const size = await Size.findOne({ product: items.product, size: items.size })
            size.quantity += items.quantity
            await size.save()
        }
        const allItemsCancelled = orderedProducts.orderedItems.every(
            item => item.cancelStatus === 'canceled'
        );

        if (allItemsCancelled) {
            orderedProducts.status = 'Canceled';
        }
        const itemTotal = items.price * items.quantity;
        const currentTotalPrice = orderedProducts.totalPrice;
        const currentDiscount = orderedProducts.discount || 0;

        let proportionalDiscount = 0;
        if (currentTotalPrice > 0 && currentDiscount > 0) {
            proportionalDiscount = (itemTotal / currentTotalPrice) * currentDiscount;
        }

        const refundAmount = itemTotal - proportionalDiscount;

        orderedProducts.totalPrice -= itemTotal;
        orderedProducts.discount -= proportionalDiscount;
        orderedProducts.finalAmount -= refundAmount;

        if (orderedProducts.totalPrice < 0) orderedProducts.totalPrice = 0;
        if (orderedProducts.discount < 0) orderedProducts.discount = 0;
        if (orderedProducts.finalAmount < 0) orderedProducts.finalAmount = 0;

        if (orderedProducts.paymentMethod !== 'COD' && orderedProducts.paymentStatus !== 'Pending') {
            const wallet = await Wallet.findOne({ userId: orderedProducts.userId });
            const transaction = {
                transactionType: 'refund',
                transactionAmount: Math.round(refundAmount * 100) / 100,
                transactionDate: new Date(),
                description: `Refund for canceled item from order ${orderId}`
            };

            if (wallet) {
                wallet.balance += refundAmount;
                wallet.transactionHistory.push(transaction);
                await wallet.save();
            } else {
                const newWallet = new Wallet({
                    userId: orderedProducts.userId,
                    balance: refundAmount,
                    transactionHistory: [transaction]
                });
                await newWallet.save();
            }
        }

        await orderedProducts.save();

        return res.status(StatusCodes.OK).json({ message: Messages.ITEM_CANCELED });

    } catch (error) {
        console.log("Error in productCancel:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SOMETHING_WENT_WRONG });
    }
}

export { orderList, orderStatus, handleReturn, orderCancelled, viewOrders }