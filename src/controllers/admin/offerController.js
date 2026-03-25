import { Category } from "../../models/categoriesSchema.js";
import { Product } from "../../models/productSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

const loadOfferPage = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 5;
        let search = req.query.search || "";

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const categories = await Category.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const count = await Category.countDocuments(query);
        const totalpages = Math.ceil(count / limit);

        return res.render("admin/offerManagement", {
            categories,
            currentPage: page,
            totalpages,
            search,
        });
    } catch (error) {
        console.log("Error loading offer page:", error);
        return res.render("admin/pageNotFound");
    }
};

const addCategoryOffer = async (req, res) => {
    try {
        const percentage = parseFloat(req.body.percentage);
        const categoryId = req.body.categoryId;

        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: false,
                message: Messages.OFFER_INVALID_PERCENTAGE,
            });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: Messages.CATEGORY_NOT_FOUND,
            });
        }

        category.categoryOffer = Math.abs(percentage);
        await category.save();

        const products = await Product.find({ category: categoryId });
        for (let product of products) {
            const discount = product.regularPrice * (percentage / 100);
            product.salePrice = product.regularPrice - discount;
            await product.save();
        }

        res.status(StatusCodes.OK).json({ status: true });
    } catch (error) {
        console.log("Error adding offer:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: Messages.SERVER_ERROR,
        });
    }
};

const removeCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: Messages.CATEGORY_NOT_FOUND,
            });
        }

        category.categoryOffer = 0;
        await category.save();

        const products = await Product.find({ category: categoryId });
        for (let product of products) {
            product.salePrice = product.regularPrice;
            await product.save();
        }

        res.status(StatusCodes.OK).json({
            status: true,
            message: Messages.OFFER_REMOVED,
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: Messages.SERVER_ERROR,
        });
    }
};

export { loadOfferPage, addCategoryOffer, removeCategoryOffer };
