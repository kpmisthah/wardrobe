import { Category } from "../../models/categoriesSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

const loadProductDetails = async (req, res) => {
    try {
        const userId = req.session.user;
        const productId = req.query.id;
        const product = await Product.findById(productId)
            .populate("category")
            .populate("sizeOptions");

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).render("user/pageNotFound");
        }

        const category = product.category._id;
        const relatedProducts = await Product.find({
            category: category,
            _id: { $ne: productId },
        }).limit(4);

        const userData = userId ? await User.findById(userId) : null;

        return res.render("user/productDetails", {
            products: [product],
            product,
            relatedProducts,
            user: userData,
        });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
    }
};

export { loadProductDetails };