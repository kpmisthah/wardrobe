import { Category } from '../models/categoriesSchema.js';

/**
 * Find a category by its MongoDB _id.
 */
const findCategoryById = (id) => Category.findById(id);

/**
 * Find categories with optional query and pagination.
 */
const findCategories = (query = {}, page = 1, limit = 4) =>
    Category.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

/**
 * Count categories matching a query.
 */
const countCategories = (query = {}) => Category.countDocuments(query);

/**
 * Find category by name (case-insensitive) excluding a specific ID.
 */
const findCategoryByName = (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) query._id = { $ne: excludeId };
    return Category.findOne(query);
};

export const categoryRepository = {
    findCategoryById,
    findCategories,
    countCategories,
    findCategoryByName,
};
