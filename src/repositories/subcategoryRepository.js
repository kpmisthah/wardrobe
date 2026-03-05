import { Subcategory } from '../models/subcategorySchema.js';

/**
 * Find a subcategory by its MongoDB _id.
 */
const findSubcategoryById = (id) => Subcategory.findById(id);

/**
 * Find subcategories with optional query and pagination.
 */
const findSubcategories = (query = {}, page = 1, limit = 10) =>
    Subcategory.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

/**
 * Count subcategories matching a query.
 */
const countSubcategories = (query = {}) => Subcategory.countDocuments(query);

/**
 * Find subcategory by name (case-insensitive) excluding a specific ID.
 */
const findSubcategoryByName = (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) query._id = { $ne: excludeId };
    return Subcategory.findOne(query);
};

export const subcategoryRepository = {
    findSubcategoryById,
    findSubcategories,
    countSubcategories,
    findSubcategoryByName,
};
