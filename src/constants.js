export const DB_NAME = 'webstore';

// ─── HTTP Status Codes ────────────────────────────────────────────────────────
export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
});

// ─── Order Statuses ───────────────────────────────────────────────────────────
export const ORDER_STATUS = Object.freeze({
    PENDING: 'Pending',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    COMPLETED: 'Completed',
    RETURNED: 'Returned',
    CANCELED: 'Canceled',
});

// ─── Payment Statuses ─────────────────────────────────────────────────────────
export const PAYMENT_STATUS = Object.freeze({
    PENDING: 'Pending',
    FAILED: 'Failed',
    SUCCESS: 'Success',
});

// ─── Item Cancel & Return Statuses ────────────────────────────────────────────
export const CANCEL_STATUS = Object.freeze({
    COMPLETED: 'completed',
    CANCELED: 'canceled',
});

export const RETURN_STATUS = Object.freeze({
    NOT_REQUESTED: 'Not Requested',
    REQUESTED: 'Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
});

// ─── Response Messages ────────────────────────────────────────────────────────
export const MESSAGES = Object.freeze({
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Not found',
    UNAUTHORIZED: 'Unauthorized action',
    ORDER_NOT_FOUND: 'Order not found',
    ITEM_NOT_FOUND: 'Item not found',
    ITEM_ALREADY_CANCELED: 'Item already canceled',
    CANCEL_FAILED_PAYMENT: 'Cannot cancel an order with a failed payment',
    ITEM_CANCELED: 'Item canceled successfully',
    ORDER_CANCELED: 'Order canceled successfully',
    STATUS_UPDATED: 'Status updated successfully',
    COUPON_EXISTS: 'Coupon already exists',
    COUPON_ADDED: 'Coupon added successfully',
    COUPON_UPDATED: 'Coupon updated successfully',
    COUPON_DELETED: 'Coupon deleted successfully',
    COUPON_NOT_FOUND: 'Coupon not found',
    CATEGORY_EXISTS: 'Category already exists',
    CATEGORY_ADDED: 'Category added successfully',
    OFFER_INVALID_PERCENTAGE: 'Percentage must be between 0 and 100',
    OFFER_INVALID_CATEGORY: 'Category ID is required',
    OFFER_REMOVED: 'Offer removed successfully',
});