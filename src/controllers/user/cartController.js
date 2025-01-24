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

const cart = async (req, res) => {
  try {
    const owner = req.session.user;
    const user = await User.findOne({ _id: owner });

    //this got from cart.js
    const { productId, name, price, stock, size } = req.body;

    //check the stock of the product and user enter stock
    const productSize = await Size.findOne({ product: productId, size });

    let cart = await Cart.findOne({ userId: owner });
    let maxQtyPerPerson = 10;
    if (!cart) {
      cart = new Cart({ userId: user, items: [], maxQtyPerPerson, bill: 0 });
    }

    //find the item in cart
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
      return res
        .status(400)
        .json({
          message: `Not enough stock.`,
          stockLeft: productSize.quantity,
        });
    }

    //update cart item
    if (itemIndex != -1) {
      cart.items[itemIndex].quantity = totalQuantity;
      cart.items[itemIndex].totalPrice = price * totalQuantity;
    } else {
      cart.items.push({
        product: productId,
        name,
        quantity: stock,
        size: size,
        price,
        totalPrice: price * requestedQuantity,
      });
    }
    //change the quantity of stock in size schema
    // productSize.quantity -= requestedQuantity;
    if (productSize.quantity < 0) {
      return res.status(400).json({ message: `Not enough stock` });
    }
    // await productSize.save();

    cart.bill = cart.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );
    await cart.save();
    res.status(200).json({ message: "Item added to the cart successfully" });
  } catch (error) {
    console.log("Error in addToCart:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // Extract size and quantity 
    // const itemToDelete = cart.items[itemIndex];

    // Remove the item
    cart.items.splice(itemIndex, 1);

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
    console.log("product size"+productSize);
    
    // console.log(cart.items.product+"ith correct aano")
    const cartIndex = cart.items.findIndex(
      (item) => item.product.toString() == productId && item.size == size
    );
    console.log("acrt index"+cartIndex);
    
    const cartItem = cart.items[cartIndex];
    console.log("the cart item "+cartItem);
    
    const currrentQuantity = cartItem.quantity;
    console.log("current quanitty"+currrentQuantity);
    
    let maxQuantityPerPerson = 10;
    
    let newQuantity = currrentQuantity + 1;
    if (newQuantity > maxQuantityPerPerson) {
      return res.status(400).json({
        message: `Cannot add more than 10 units per person.`,
      });
    }
    if (newQuantity > productSize.quantity) {
      return res
        .status(400)
        .json({
          message: `Not enough stock.`,
          stockLeft: productSize.quantity,
        });
    }

    cart.items[cartIndex].quantity = newQuantity;
    console.log(cart.items[cartIndex].quantity);
    
    cart.items[cartIndex].totalPrice = cartItem.price * newQuantity;
    console.log("cart price"+cart.items[cartIndex].totalPrice);
    
    // // productSize.quantity -= 1;
    // await productSize.save();
    if (productSize.quantity < 0) {
      return res.status(400).json({ message: `Not enough stock` });
    }
    // cart.bill = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    cart.bill = cart.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );
    await cart.save();
    return res
      .status(200)
      .json({ message: "Item added to the cart successfully" ,newTotalPrice: cart.items[cartIndex].totalPrice,
        newCartTotal: cart.bill,newQuantity});
  } catch (error) {
    console.log("The error is " + error);
  }
};
const dec = async (req, res) => {
  try {
    //product dec cheyyumbo eth size mansilaaki ath quantity decrement cheyynm
    const userId = req.session.user;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const { productId } = req.body;
    // const productSize = await Size.findOne({ product: productId, size });
    const cartIndex = cart.items.findIndex(
      (item) => item.product.toString() == productId
    );
    const cartItem = cart.items[cartIndex];
    const currrentQuantity = cartItem.quantity;
    let newQuantity = currrentQuantity - 1;

    cart.items[cartIndex].quantity = newQuantity;
    cart.items[cartIndex].totalPrice = cartItem.price * newQuantity;
    // productSize.quantity += 1;
    // await productSize.save();

    // cart.bill = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
    cart.bill = cart.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    );
    await cart.save();
    return res
      .status(200)
      .json({ message: "Item rmoved from the cart successfully" ,newQuantity, newTotalPrice: cart.items[cartIndex].totalPrice,newCartTotal: cart.bill});
  } catch (error) {
    console.error("Error in decrement:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export { loadCart, cart, inc, dec, deleteItem };
