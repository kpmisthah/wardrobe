import { Product } from '../models/productSchema.js';

/**
 * Find a product by its MongoDB _id.
 */
const findProductById = (id) => Product.findById(id);

/**
 * Find products with optional query and pagination.
 */
const findProducts = (query = {}, page = 1, limit = 10) =>
    Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'category', select: 'name' })
        .populate('sizeOptions');

/**
 * Count products matching a query.
 */
const countProducts = (query = {}) => Product.countDocuments(query);

/**
 * Check if a product with the given name already exists (excluding a specific id).
 */
const findDuplicateProduct = (name, excludeId = null) => {
    const query = { name };
    if (excludeId) query._id = { $ne: excludeId };
    return Product.findOne(query);
};

export const productRepository = {
    findProductById,
    findProducts,
    countProducts,
    findDuplicateProduct,
};
