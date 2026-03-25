import { Order } from '../models/orderIdSchema.js';

/**
 * Find a single order by its orderId string and userId.
 */
const findOrderByOrderId = (orderId, userId) =>
    Order.findOne({ orderId, userId });

/**
 * Find a single order by its MongoDB _id and userId.
 */
const findOrderById = (id, userId) =>
    Order.findOne({ _id: id, userId }).populate('orderedItems.product');

/**
 * Find orders for admin with optional query, pagination.
 */
const findOrdersForAdmin = (query = {}, page = 1, limit = 4) =>
    Order.find(query)
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

/**
 * Count orders matching a query.
 */
const countOrders = (query = {}) => Order.countDocuments(query);

/**
 * Find a single order by its MongoDB _id for admin (no userId restriction).
 */
const findOrderByIdAdmin = (id) =>
    Order.findOne({ _id: id })
        .populate('orderedItems.product')
        .populate('userId');

/**
 * Update order status by orderId.
 */
const updateOrderStatusByOrderId = (orderId, status) =>
    Order.findOneAndUpdate({ orderId }, { status }, { new: true });

export const orderRepository = {
    findOrderByOrderId,
    findOrderById,
    findOrdersForAdmin,
    countOrders,
    findOrderByIdAdmin,
    updateOrderStatusByOrderId,
};
