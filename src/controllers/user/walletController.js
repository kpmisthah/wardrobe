import { Wallet } from "../../models/walletSchema.js";
import { User } from "../../models/userSchema.js";
import { Cart } from "../../models/cartSchema.js";
import { Order } from "../../models/orderIdSchema.js";
import { Product } from "../../models/productSchema.js";
import { Address } from "../../models/addressSchema.js";
import { Size } from "../../models/sizeSchema.js";
const loadWallet = async (req, res) => {
  try {
    const user = req.session.user;
    const wallet = await Wallet.findOne({ userId: user });
    if (user) {
      let userData = await User.findOne({ _id: user });
      return res.render("user/wallet", { wallet, user: userData });
    }
  } catch (error) {
    console.log("The error is" + error);
  }
};

const wallet = async (req, res) => {
  try {
    const { payment, addressId } = req.body;
    const userId = req.session.user;
    const wallet = await Wallet.findOne({ userId });
    const order = await Order.findOne({ userId });
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (let item of cart.items) {
      const size = await Size.findOne({
        product: item.product,
        size: item.size,
      });

      if (!size) {
        return res.status(400).json({
          message: `Size ${item.size} for product ${item.name} is not available.`,
        });
      }

      if (size.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name} (Size: ${item.size}). Please remove it from the cart.`,
        });
      }
    }

    for (let item of cart.items) {
      const size = await Size.findOne({
        product: item.product,
        size: item.size,
      });
      size.quantity -= item.quantity;
      await size.save();
    }
    const address = await Address.findOne({ userId, "address._id": addressId });
    const addressIndex = address.address.findIndex(
      (addr) => addr._id.toString() == addressId
    );
    const selectedAddress = address.address[addressIndex];
    let coupon_code = req.session.coupon;
    let final_amount = req.session.finalAmount;
    const discount_amount = req.session.discount;

    //aadhym order final amount vechittan nokeene so userid oru issue aayathond logic completely maati
    const amountToDeduct = final_amount || cart.bill;

    if (wallet.balance < amountToDeduct) {
      return res.status(400).json({ message: "Balance is insufficient" });
    } else {
      let orderedItems = [];
      for (let item of cart.items) {
        orderedItems.push({
          product: item.product,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          couponCode: coupon_code,
          price: item.price,
          returnStatus: "Not Requested",
        });
      }

      const newOrder = new Order({
        orderedItems,
        address: {
          name: selectedAddress.name,
          email: selectedAddress.email,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
          zipCode: selectedAddress.zipCode,
          houseNumber: selectedAddress.houseNumber,
          district: selectedAddress.district,
          state: selectedAddress.state,
        },
        userId,
        paymentMethod: payment,
        status: "Pending",
        totalPrice: cart.bill,
        finalAmount: amountToDeduct,
        discount: discount_amount,
        paymentStatus: "Success",
        invoiceDate: new Date(),
      });
      await newOrder.save();
      wallet.balance -= amountToDeduct;
      await wallet.save();
      console.log("wallet balance is" + wallet.balance);
      cart.items = [];
      cart.bill = 0;
      await cart.save();
      return res
        .status(200)
        .json({
          message: "order placed successfully",
          redirectUrl: "/order-confirmation",
        });
    }

    // let orderedItems = [];
    // for (let item of cart.items) {
    //   orderedItems.push({
    //     product: item.product,
    //     name: item.name,
    //     size: item.size,
    //     quantity: item.quantity,
    //     couponCode: coupon_code,
    //     price: item.price,
    //     returnStatus: "Not Requested",
    //   });
    // }
    // let totalPrice = cart.bill;
    // const newOrder = new Order({
    //   orderedItems,
    //   address: addressId,
    //   userId,
    //   paymentMethod: payment,
    //   status: "Pending",
    //   totalPrice,
    //   finalAmount: final_amount || totalPrice,
    //   discount: discount_amount,
    //   invoiceDate: new Date(),
    // });
    // await newOrder.save()
    // cart.items = []
    // cart.bill = 0
    // await cart.save()
    // return res.status(200).json({ message: "Order placed successfully", redirectUrl: "/order-confirmation" });
  } catch (error) {
    console.log("The error is " + error);
  }
};
export { loadWallet, wallet };
