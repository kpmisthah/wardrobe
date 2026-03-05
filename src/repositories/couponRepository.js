import { Coupon } from '../models/couponSchema.js';

/**
 * Find a coupon by its code.
 */
const findCouponByCode = (code) => Coupon.findOne({ code });

/**
 * Find all coupons with pagination.
 */
const findCoupons = (page = 1, limit = 10) =>
    Coupon.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

/**
 * Count all coupons.
 */
const countCoupons = () => Coupon.countDocuments();

/**
 * Delete a coupon by its ID.
 */
const deleteCoupon = (id) => Coupon.findByIdAndDelete(id);

/**
 * Find a coupon by ID.
 */
const findCouponById = (id) => Coupon.findById(id);

export const couponRepository = {
    findCouponByCode,
    findCoupons,
    countCoupons,
    deleteCoupon,
    findCouponById,
};
