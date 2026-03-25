import { Cart } from "../../models/cartSchema.js";
import { Product } from "../../models/productSchema.js";
import { User } from "../../models/userSchema.js";
import { Wishlist } from "../../models/wishlistSchema.js";
import { Size } from "../../models/sizeSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";


const loadWishlist = async (req, res) => {
    try {
        const user = req.session.user
        const wishlist = await Wishlist.findOne({ userId: user }).populate('items.product').lean();

        if (user) {
            let userData = await User.findOne({ _id: user });

            if (wishlist && wishlist.items && wishlist.items.length > 0) {
                for (const item of wishlist.items) {
                    if (item.product && item.size) {
                        const sizeDoc = await Size.findOne({
                            product: item.product._id,
                            size: item.size
                        });
                        item.stockQuantity = sizeDoc ? sizeDoc.quantity : 0;
                    } else {
                        item.stockQuantity = 0;
                    }
                }
            }

            return res.render('user/wishlist', { wishlist, user: userData })
        } else {
            return res.redirect('/login')
        }


    } catch (error) {
        console.log("Error in loadWishlist:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
    }
}

const addToWishlist = async (req, res) => {
    try {
        const user = req.session.user
        const { productId, size, quantity } = req.body
        let wishlist = await Wishlist.findOne({ userId: user })
        if (!wishlist) {
            wishlist = new Wishlist({ userId: user, items: [] })
        }
        const items = wishlist.items.some((item) => item.product == productId && item.size == size && item.quantity == 1)
        if (quantity > 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: Messages.WISHLIST_ONLY_ONE
            });
        }
        if (!items) {
            wishlist.items.push({
                product: productId,
                size,
                quantity
            })
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.WISHLIST_PRODUCT_EXISTS })
        }
        await wishlist.save()
        return res.status(StatusCodes.OK).json({ message: Messages.WISHLIST_ADDED })
    } catch (error) {
        console.log("The error is " + error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
    }
}

const wishlistToCart = async (req, res) => {
    try {
        const userId = req.session.user
        const { productId, productName, productSize, productPrice } = req.body

        // Check stock availability first
        const sizeDoc = await Size.findOne({ product: productId, size: productSize });
        if (!sizeDoc || sizeDoc.quantity < 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.PRODUCT_OUT_OF_STOCK });
        }

        let cart = await Cart.findOne({ userId })

        if (!cart) {
            cart = new Cart({ userId, items: [], bill: 0 })
        }

        const cartIndex = cart.items.findIndex((item) => item.product.toString() == productId && item.size == productSize)

        if (cartIndex != -1) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.PRODUCT_ALREADY_IN_CART })
        } else {
            const newItem = {
                product: productId,
                name: productName,
                quantity: 1,
                size: productSize,
                price: Number(productPrice),
                totalPrice: Number(productPrice)
            };
            cart.items.push(newItem)
        }

        cart.bill += Number(productPrice);
        await cart.save()
        return res.status(StatusCodes.OK).json({ message: Messages.PRODUCT_ADDED_CART })
    } catch (error) {
        console.log("error is " + error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
    }
}

const removeWishlist = async (req, res) => {
    try {
        const userId = req.session.user
        const { productId } = req.params
        console.log("The aprams is" + productId)
        const wishlist = await Wishlist.findOneAndUpdate({ userId }, { $pull: { items: { _id: productId } } })
        console.log("The wishlsit is" + wishlist);

        if (!wishlist) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.WISHLIST_NOT_FOUND })
        }
        return res.status(StatusCodes.OK).json({ message: Messages.WISHLIST_DELETED })

    } catch (error) {
        console.log("Error in removeWishlist:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
    }
}
export { loadWishlist, addToWishlist, wishlistToCart, removeWishlist }