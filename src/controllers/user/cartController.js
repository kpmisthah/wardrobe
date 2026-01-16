import { User } from "../../models/userSchema.js";
import { Cart } from "../../models/cartSchema.js";
import { Size } from "../../models/sizeSchema.js";
import { Product } from "../../models/productSchema.js";
import { removeWishlist } from "./wishlistController.js";

const loadCart = async (req, res) => {
  try {
    let userId = req.session.user;
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.product",
      select: "name productImage price description",
    });

    if (cart && cart.items.length > 0) {
      const userData = await User.findOne({ _id: userId });
      return res.render("user/cart", { user: userData, cart });
    } else {
      return res.render("user/cart", {
        user: await User.findOne({ _id: userId }),
        cart: { items: [], bill: 0 },
      });
    }
  } catch (error) {
    console.log("the error is" + error);
    return res.redirect("/notfound");
  }
};

// const cart = async (req, res) => {
//   try {
//     const owner = req.session.user;
//     const user = await User.findOne({ _id: owner });

//     //this got from cart.js
//     const { productId, name, price, stock, size } = req.body;

//     //check the stock of the product and user enter stock
//     const productSize = await Size.findOne({ product: productId, size });

//     let cart = await Cart.findOne({ userId: owner });
//     let maxQtyPerPerson = 10;
//     if (!cart) {
//       cart = new Cart({ userId: user, items: [], maxQtyPerPerson, bill: 0 });
//     }

//     //find the item in cart
//     let itemIndex = cart.items.findIndex(
//       (item) => item.product.toString() == productId && item.size == size
//     );

//     let requestedQuantity = parseInt(stock);
//     let existingQuantity = itemIndex != -1 ? cart.items[itemIndex].quantity : 0;
//     const totalQuantity = requestedQuantity + existingQuantity;
//     if (totalQuantity > maxQtyPerPerson) {
//       return res.status(400).json({
//         message: `Cannot add more than 10 units per person.`,
//       });
//     }
//     if (requestedQuantity > productSize.quantity) {
//       return res
//         .status(400)
//         .json({
//           message: `Not enough stock.`,
//           stockLeft: productSize.quantity,
//         });
//     }

//     //update cart item
//     if (itemIndex != -1) {
//       cart.items[itemIndex].quantity = totalQuantity;
//       cart.items[itemIndex].totalPrice = price * totalQuantity;
//     } else {
//       cart.items.push({
//         product: productId,
//         name,
//         quantity: requestedQuantity,
//         size: size,
//         price,
//         totalPrice: price * requestedQuantity,
//       });
//     }

//     if (productSize.quantity < 0) {
//       return res.status(400).json({ message: `Not enough stock` });
//     }

//     cart.bill = cart.items.reduce(
//       (acc, curr) => acc + curr.quantity * curr.price,
//       0
//     );
//     await cart.save();
//     res.status(200).json({ message: "Item added to the cart successfully" });
//   } catch (error) {
//     console.log("Error in addToCart:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const cart = async (req, res) => {
  try {
    const owner = req.session.user;
    const user = await User.findOne({ _id: owner });

    const { productId, name, price, stock, size } = req.body;

    const productSize = await Size.findOne({ product: productId, size });

    let cart = await Cart.findOne({ userId: owner });
    let maxQtyPerPerson = 10;

    if (!cart) {
      cart = new Cart({ userId: user, items: [], maxQtyPerPerson, bill: 0, cartCount: 0 });
    }

    let itemIndex = cart.items.findIndex(
      (item) => item.product.toString() == productId && item.size == size
    );

    let requestedQuantity = parseInt(stock);
    let existingQuantity = itemIndex != -1 ? cart.items[itemIndex].quantity : 0;
    const totalQuantity = requestedQuantity + existingQuantity;

    if (totalQuantity > maxQtyPerPerson) {
      return res.status(400).json({
        message: `Cannot add more than 10 units per person.`,
      });
    }
    if (requestedQuantity > productSize.quantity) {
      return res.status(400).json({
        message: `Not enough stock.`,
        stockLeft: productSize.quantity,
      });
    }

    if (itemIndex != -1) {
      cart.items[itemIndex].quantity = totalQuantity;
      cart.items[itemIndex].totalPrice = price * totalQuantity;
    } else {
      cart.items.push({
        product: productId,
        name,
        quantity: requestedQuantity,
        size: size,
        price,
        totalPrice: price * requestedQuantity,
      });
    }

    if (productSize.quantity < 0) {
      return res.status(400).json({ message: `Not enough stock` });
    }

    // Update the cart count based on total items
    cart.cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    cart.bill = cart.items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);

    await cart.save();
    res.status(200).json({ message: "Item added to the cart successfully", cartCount: cart.cartCount });
  } catch (error) {
    console.log("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//check the stock when proceed to checkout 

const validateCartStock = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const invalidItems = [];

    for (const item of cartItems) {
      const productSize = await Size.findOne({
        product: item.product,
        size: item.size
      });

      if (!productSize || productSize.quantity < item.quantity) {
        invalidItems.push({
          name: item.name,
          size: item.size,
          requestedQty: item.quantity,
          availableQty: productSize ? productSize.quantity : 0
        });
      }
    }

    if (invalidItems.length > 0) {
      return res.status(200).json({
        valid: false,
        invalidItems
      });
    }

    return res.status(200).json({
      valid: true
    });

  } catch (error) {
    console.error('Error in validateCartStock:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
const deleteItem = async (req, res) => {
  try {
    const user = req.session.user;
    const productId = req.params.productId;

    // Find the cart
    const cart = await Cart.findOne({ userId: user });

    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    // Find the index of the item to be deleted
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Item not found in cart" });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);
    const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    res.json({ success: true, cartCount });

    res.json({ success: true, cartCount: totalCartItems });
    // cart bill veendum calculate cheyya
    cart.bill = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    await cart.save();

    return res.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ success: false, error: "Failed to remove item" });
  }
};

const inc = async (req, res) => {
  try {
    const userId = req.session.user;
    const { productId, size } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productSize = await Size.findOne({ product: productId, size });

    const cartIndex = cart.items.findIndex(
      (item) => item.product.toString() == productId && item.size == size
    );

    if (cartIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const cartItem = cart.items[cartIndex];
    const currrentQuantity = cartItem.quantity;
    const maxQuantityPerPerson = 10;

    let newQuantity = currrentQuantity + 1;

    if (newQuantity > maxQuantityPerPerson) {
      return res.status(400).json({
        message: `Cannot add more than 10 units per person.`,
      });
    }

    if (newQuantity > productSize.quantity) {
      return res.status(400).json({
        message: `Not enough stock.`,
        stockLeft: productSize.quantity,
      });
    }

    // Update Item
    cart.items[cartIndex].quantity = newQuantity;
    cart.items[cartIndex].totalPrice = cartItem.price * newQuantity;

    if (productSize.quantity < 0) {
      return res.status(400).json({ message: `Not enough stock` });
    }

    // Update Bill
    cart.bill = cart.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );

    await cart.save();

    // Calculate Total Count
    const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
      success: true,
      message: "Item quantity incremented",
      newQuantity: newQuantity,
      newTotalPrice: cart.items[cartIndex].totalPrice,
      newCartTotal: cart.bill,
      cartCount: cartCount
    });

  } catch (error) {
    console.log("The error is " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const dec = async (req, res) => {
  try {
    const userId = req.session.user;
    const { productId, size } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartIndex = cart.items.findIndex(
      (item) => item.product.toString() == productId && item.size == size
    );

    if (cartIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const cartItem = cart.items[cartIndex];
    const currrentQuantity = cartItem.quantity;

    // Prevent decrementing below 1
    if (currrentQuantity <= 1) {
      return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    let newQuantity = currrentQuantity - 1;

    // Update Item
    cart.items[cartIndex].quantity = newQuantity;
    cart.items[cartIndex].totalPrice = cartItem.price * newQuantity;

    // Update Bill
    cart.bill = cart.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );

    await cart.save();

    const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
      success: true,
      message: "Item quantity decremented",
      newQuantity: newQuantity,
      newTotalPrice: cart.items[cartIndex].totalPrice,
      newCartTotal: cart.bill,
      cartCount: cartCount
    });

  } catch (error) {
    console.error("Error in decrement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const cartcount = async (req, res) => {
  try {
    const userId = req.session.user
    console.log("user", userId);

    const cart = await Cart.findOne({ userId });
    const count = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    console.log("The count", count);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart count" });
  }
}
export { loadCart, cart, inc, dec, deleteItem, validateCartStock, cartcount };
