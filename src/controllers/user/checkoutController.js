import { User } from "../../models/userSchema.js";
import { Address } from "../../models/addressSchema.js";
import { Cart } from "../../models/cartSchema.js";
import { Order } from "../../models/orderIdSchema.js";
import { Coupon } from "../../models/couponSchema.js";
import PDFDocument from "pdfkit";
import { Size } from "../../models/sizeSchema.js";
import { orders } from "./orderController.js";
import { rzp } from "../../db/razorpay.js";

const loadCheckout = async (req, res) => {
  try {
    let user = req.session.user;
    let userAddress = await Address.findOne({ userId: user });
    const cart = await Cart.findOne({ userId: user }).populate("items.product");
    console.log("The cart is"+cart);
    
    const coupon = await Coupon.find();
    
    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart"); 
    }

    if (!userAddress) {
      return res.redirect("/getAddress");
    }

    if (user) {
      let userData = await User.findOne({ _id: user });
      return res.render("user/checkout", {
        user: userData,
        address: userAddress.address,
        cart,
        coupon,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getEditAddressPage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user;
    const userAddress = await Address.findOne({ userId });
    if (!userAddress) {
      return res.redirect("/getAddress");
    }
    const address = userAddress.address.find(
      (addr) => addr._id.toString() === id
    );
    if (!address) {
      return res.redirect("/getAddress");
    }
    return res.render("user/edit-checkaddress", { address });
  } catch (error) {
    console.log("the eror" + error);
  }
};

const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user;
    const data = req.body;
    await Address.findOneAndUpdate(
      { userId, "address._id": id },
      {
        $set: {
          "address.$.name": data.name,
          "address.$.email": data.email,
          "address.$.phone": data.phone,
          "address.$.city": data.city,
          "address.$.zipCode": data.zipCode,
          "address.$.houseNumber": data.houseNumber,
          "address.$.district": data.district,
          "address.$.state": data.state,
        },
      }
    );
    res.status(200).json({ message: "data updated successfully" });
  } catch (error) {
    console.log("somethig went wrong", error);
  }
};

const loadAddcheckoutaddress = async (req, res) => {
  try {
    return res.render("user/addCheckoutaddress");
  } catch (error) {
    console.log("The error is " + error);
  }
};

const addcheckoutAddress = async (req, res) => {
  try {
    console.log("hello");
    let user = req.session.user;
    const data = req.body;
    // let user = await User.findOne({_id:userData})
    const userAddress = await Address.findOne({ userId: user });
    console.log("Thee" + userAddress);
    if (userAddress) {
      userAddress.address.push({
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        zipCode: data.zipCode,
        state: data.state,
        houseNumber: data.houseNumber,
        district: data.district,
      });
      await userAddress.save();
      return res
        .status(200)
        .json({ message: "Address is addedd successfully" });
    } else {
      const newAddress = new Address({
        userId: user,
        address: [
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            zipCode: data.zipCode,
            state: data.state,
            houseNumber: data.houseNumber,
            district: data.district,
          },
        ],
      });
      await newAddress.save();
      return res.status(200).json({ message: "Address added successfully" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { payment, addressId } = req.body;
    const userId = req.session.user;
    let coupon_code = req.session.coupon;
    let final_amount = req.session.finalAmount||null;
    const discount_amount = req.session.discount||0;
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

      for (let item of cart.items) {
        const size = await Size.findOne({ product: item.product, size: item.size });
        if (size.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock`,
          });
        }
      }
  
      for (let item of cart.items) {
        const size = await Size.findOne({ product: item.product, size: item.size });
        size.quantity -= item.quantity;
        await size.save();
      }  
    const address = await Address.findOne({ userId, "address._id": addressId });
    if (!address) {
      return res.status(404).json({ message: "Address not found." });
    }
    const addressIndex = address.address.findIndex(
      (addr) => addr._id.toString() == addressId
    );
   
    
    console.log("the index of address"+addressIndex);
    
    const selectedAddress = address.address[addressIndex];

    let orderedItems = [];
    //to
    // Add the size of particular product and manage the stock
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

    let totalPrice = cart.bill;
    if (payment == "COD" &&  final_amount||totalPrice > 1000) {
      return res
        .status(400)
        .json({
          message: "Cash on Delivery is not allowed for orders above Rs 1000.",
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
      totalPrice,
      finalAmount: final_amount || totalPrice,
      discount: discount_amount,
      paymentStatus: 'Pending',
      invoiceDate: new Date(),
    });
    await newOrder.save();

    cart.items = [];
    cart.bill = 0;
    await cart.save();
    return res
      .status(200)
      .json({
        message: "Order placed successfully",
        redirectUrl: "/order-confirmation",
      });
  } catch (error) {
    console.log("The error is" + error);
  }
};
const createPendingOrder = async (req, res) => {
  try {
    const { addressId, amount } = req.body;
    const userId = req.session.user;
    
    const cart = await Cart.findOne({ userId });
    const address = await Address.findOne({ userId });
    const addressIndex = address.address.findIndex(
      (adr) => adr._id.toString() === addressId
    );
    const selectedAddress = address.address[addressIndex];

    const coupon_code = req.session.coupon;
    const final_amount = req.session.finalAmount;

    const orderedItems = cart.items.map(item => ({
      product: item.product,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      price: item.totalPrice,
      couponCode: coupon_code,
      returnStatus: "Not Requested",
    
    }));

    const newOrder = new Order({
      orderedItems,
      totalPrice: cart.bill,
      discount: cart.bill - (final_amount || cart.bill),
      finalAmount: final_amount,
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
      paymentMethod: "razorpay",
      status: "Pending",
      paymentStatus: "Pending",
      invoiceDate: new Date(),
    });

    await newOrder.save();

    res.json({
      status: 200,
      message: "Pending order created",
      mongoOrderId: newOrder._id
    });
  } catch (error) {
    console.error("Error creating pending order:", error);
    res.status(500).json({ message: "Failed to create pending order" });
  }
};

const orderConfirm = async (req, res) => {
  try {
    const user = req.session.user;
    const orders = await Order.findOne({ userId: user })
    return res.render("user/orderconfirmed", { orders });
  } catch (error) {
    console.log("the error for orders is" + orders);
  }
};
const saveOrder = async (req, res) => {
  try {
    let userId = req.session.user;
    const { mongoOrderId,addressId, amount } = req.body;
    const order = await Order.findById(mongoOrderId)
    console.log("the order is"+order);
    
    if (!order) {
      throw new Error("Order not found");
    }
    const cart = await Cart.findOne({ userId: order.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    

      for (let item of cart.items) {
        const size = await Size.findOne({ product: item.product, size: item.size });
  console.log("the suize "+size);
  
        if (!size) {
          return res.status(400).json({
            message: `Size ${item.size} for product ${item.name} is not available.`,
          });
        }
  
        // if (size.quantity < item.quantity) {
        //   return res.status(400).json({
        //     message: `Insufficient stock for ${item.name} (Size: ${item.size}). Please remove it from the cart.`,
        //   });
        // }
      }
      
  
      for (let item of cart.items) {
        const size = await Size.findOne({ product: item.product, size: item.size });
        size.quantity -= item.quantity;
        await size.save();
      }  
    order.paymentStatus = 'Success'
    await order.save()
    cart.items = [];
    cart.bill = 0;
    await cart.save()
    delete req.session.coupon;
    delete req.session.finalAmount;
   
    res.json({
      status: 200,
      message: "Order saved successfully",
      redirectUrl: "/order-confirmation",
    });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to save order" });
  }
};

//retrieve order
const retryPayment = async (req, res) => {
  
  try {
    const { paymentMethod , amount,originalOrderId} = req.body;
    
    const orders = await Order.findById(originalOrderId)
  
    if (orders.status !== 'Pending' || orders.paymentMethod !== 'razorpay') {
      return res.status(400).json({ success: false, message: 'Invalid order for retry payment.' });
    }

    const rzpOrder = await rzp.orders.create({
      amount: amount* 100,
      currency: "INR",
      receipt: `receipt#${orders._id}`,
      payment_capture: true,
      notes: {
        orderType: "Retry",
        paymentMethod
      },
    });

    res.json({  razorpayOrderId: rzpOrder.id, razorpayKey: process.env.RAZORPAY_KEY_ID, amount: orders.finalAmount });
  } catch (error) {
    console.error("Error creating retry payment:", error);
    res.status(500).json({ message: "Failed to create retry payment" });
  }
};

const completeRetryPayment = async(req,res)=>{
 
  try {
    const{originalOrderId,amount} = req.body
    const userId = req.session.user
    const order = await Order.findOneAndUpdate({_id:originalOrderId},{$set:{
      paymentStatus:'Success'
    }})
    
    if (!order) {
      throw new Error('Order not found');
    }
    const cart = await Cart.findOne({userId})
    cart.items = [];
    cart.bill = 0;
    await cart.save()
    res.json({success: true,message: "Payment completed successfully",redirectUrl: `/order-confirmation`});
  } catch (error) {
    console.error("Error completing retry payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete payment",
      error: error.message
    });
  }
  }


// Backend controller for applying coupon
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    console.log("teh coupon ocde"+couponCode);
    
    const userId = req.session.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }


    const coupon = await Coupon.findOne({ code: couponCode, startDate: { $lte: new Date() }, endDate: { $gte: new Date() }});
    console.log("The coupondvsjcknvbdjfslj"+coupon);
    
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    //minpurchase
    if (coupon.minPurchase > cart.bill) {
      return res.status(400).json({
        message: `Minimum purchase amount of ₹${coupon.minPurchase} required`,
      });
    }

    if (coupon.startDate > Date.now() || coupon.endDate < Date.now()) {
      return res
        .status(400)
        .json({ message: "Coupon is not valid at this time" });
    }

    //oru coupon oru user ..oru user n same coupon 2 thavana add aakan patoola
    const existingOrder = await Order.findOne({
      userId,
      "orderedItems.couponCode": { $elemMatch: { $eq: couponCode } },
    });

    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "You have already used this coupon" });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cart.bill * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    //final amount
    const finalAmount = cart.bill - discount;
    console.log("The final amount is" + finalAmount);
    req.session.coupon = coupon.code;
    req.session.finalAmount = finalAmount;
    req.session.discount = discount;
    return res.status(200).json({
      success: true,
      discount,
      finalAmount,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return res.status(500).json({
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.session.user;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(400).json({ message: "Cart not found" });
    }
    req.session.coupon = null
    req.session.finalAmount = cart.bill
    req.session.discount = 0

      // Return the response
      return res.status(200).json({
        success: true,
        originalPrice: cart.bill,
        message: "Coupon removed successfully, price reverted to original",
      });
    
  } catch (error) {
    console.error("Error removing coupon:", error);
    return res.status(500).json({
      message: "Coupon removed successfully",
      error: error.message,
    });
  }
};


const generatePdf = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).send("Order not found");
    }
    
    if (!order) {
      return res.status(404).send("Order not found");
    }
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );
    doc.pipe(res);
    doc.fontSize(10).text("YOUR LOGO", 50, 50);
    //invoice number
    doc.fontSize(10).text(`NO. ${order.orderId}`, 450, 50, { align: "right" });
    doc.fontSize(30).text("INVOICE", 50, 100);
    doc
      .fontSize(10)
      .text(
        `Date: ${new Date(order.invoiceDate).toLocaleDateString("en-US")}`,
        50,
        150
      );
    // Add billing info
    doc
      .fontSize(10)
      .text("Billed to:", 50, 180)
      .text(order.address.name, 50, 195)
      .text(order.address.houseNumber, 50, 210)
      .text(
        `${order.address.city}, ${order.address.state} ${order.address.zipCode}`,
        50,
        225
      )
      .text(order.address.email, 50, 240);

    const tableTop = 280;
    doc
      .fontSize(10)
      .text("Item", 50, tableTop)
      .text("Quantity", 200, tableTop)
      .text("Price", 300, tableTop)
      .text("Amount", 400, tableTop);
    // Add horizontal line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();
    let position = tableTop + 30;
    order.orderedItems.forEach((item) => {
      doc
        .fontSize(10)
        .text(item.name, 50, position)
        .text(item.quantity.toString(), 200, position)
        .text(`₹${(item.price/item.quantity).toFixed(2)}`, 300, position)
        .text(`₹${( item.price).toFixed(2)}`, 400, position);
      position += 20;
    });
    // Add totals
    doc.moveTo(50, position).lineTo(550, position).stroke();

    position += 20;
    doc
      .fontSize(10)
      .text("Subtotal:", 300, position)
      .text(`₹${order.totalPrice.toFixed(2)}`, 400, position);
    position += 20;
    doc
      .text("Discount:", 300, position)
      .text(`₹${order.discount.toFixed(2)}`, 400, position);
    position += 20;
    doc
      .fontSize(12)
      .text("Total:", 300, position)
      .text(`₹${order.finalAmount?order.finalAmount:order.totalPrice.toFixed(2)}`, 400, position);
    // Add payment method
    position += 40;
    doc
      .fontSize(10)
      .text(`Payment method: ${order.paymentMethod}`, 50, position);
    // Add note
    position += 20;
    doc.text("Note: Thank you for your business!", 50, position);
    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).send("Error generating invoice");
  }
};

export {
  loadCheckout,
  getEditAddressPage,
  editAddress,
  loadAddcheckoutaddress,
  addcheckoutAddress,
  placeOrder,
  orderConfirm,
  applyCoupon,
  createPendingOrder,
  saveOrder,
  removeCoupon,
  generatePdf,
  retryPayment,
  completeRetryPayment
};
