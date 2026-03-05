import { Order } from "../../models/orderIdSchema.js"
import { Size } from "../../models/sizeSchema.js"
import { User } from '../../models/userSchema.js';
import { Wallet } from '../../models/walletSchema.js';
import PDFDocument from 'pdfkit';
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS, CANCEL_STATUS, MESSAGES } from '../../constants.js';
import { orderRepository } from '../../repositories/orderRepository.js';

//load Orders page
const orders = async (req, res) => {
  try {
    const userId = req.session.user

    let page = parseInt(req.query.page) || 1
    let limit = 10
    const orders = await Order.find({ userId: userId }).skip((page - 1) * limit).limit(limit).populate('orderedItems.product').sort({ createdAt: -1 });
    let count = await Order.find({ userId: userId }).countDocuments()
    let totalpages = Math.ceil(count / limit)

    const userData = await User.findById(userId);

    return res.render('user/orders', { orders, page, totalpages, user: userData })
  } catch (error) {
    console.log("The error is" + error)
  }
}

const viewOrder = async (req, res) => {
  try {
    const user = req.session.user
    const { orderid } = req.params
    const order = await orderRepository.findOrderById(orderid, user);
    if (!order) {
      return res.redirect('/orders')
    }
    const userData = await User.findOne({ _id: user })
    return res.render('user/viewOrder', { user: userData, order })

  } catch (error) {
    console.log(error)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('user/pageNotFound')
  }
}

const orderCancel = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const userId = req.session.user;

    // Find the order containing this specific item._id and belonging to the user
    const orderedProducts = await Order.findOne({ orderId, userId })

    if (!orderedProducts) {
      console.error(`Order with ID ${orderId} not found or unauthorized`);
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.ORDER_NOT_FOUND });
    }

    // Guard: do not allow cancel on failed-payment orders
    if (orderedProducts.paymentStatus === PAYMENT_STATUS.FAILED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.CANCEL_FAILED_PAYMENT });
    }

    const itemIndex = orderedProducts.orderedItems.findIndex(
      item => item._id.toString() === productId
    );

    if (itemIndex === -1) {
      console.error(`Product with ID ${productId} not found in order ${orderId}`);
      return res.status(404).json({ message: "Item not found" });
    }

    const items = orderedProducts.orderedItems[itemIndex];

    if (items.cancelStatus === CANCEL_STATUS.CANCELED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.ITEM_ALREADY_CANCELED });
    }

    // Update stock logic
    items.cancelStatus = CANCEL_STATUS.CANCELED
    const size = await Size.findOne({ product: items.product, size: items.size })
    if (size) {
      size.quantity += items.quantity
      await size.save()
    }
    const itemTotal = items.price * items.quantity;
    const currentTotalPrice = orderedProducts.totalPrice;
    const currentDiscount = orderedProducts.discount || 0;
    let proportionalDiscount = 0;
    if (currentTotalPrice > 0 && currentDiscount > 0) {
      proportionalDiscount = (itemTotal / currentTotalPrice) * currentDiscount;
    }

    // Safety: Discount for item can't exceed item total
    if (proportionalDiscount > itemTotal) proportionalDiscount = itemTotal;

    const refundAmount = itemTotal - proportionalDiscount;

    console.log(`Cancelling Item: ${items.name}. Total: ${itemTotal}. Prop. Discount: ${proportionalDiscount}. Refund: ${refundAmount}`);

    // Update Order Fields
    orderedProducts.totalPrice -= itemTotal;
    orderedProducts.discount -= proportionalDiscount;
    orderedProducts.finalAmount = (orderedProducts.finalAmount || orderedProducts.totalPrice + itemTotal) - refundAmount;

    // Safety clamps
    if (orderedProducts.totalPrice < 0) orderedProducts.totalPrice = 0;
    if (orderedProducts.discount < 0) orderedProducts.discount = 0;
    if (orderedProducts.finalAmount < 0) orderedProducts.finalAmount = 0;

    // Process Refund to Wallet
    if (orderedProducts.paymentMethod != 'COD' && orderedProducts.paymentStatus != 'Pending') {
      const wallet = await Wallet.findOne({ userId: orderedProducts.userId })

      const transaction = {
        transactionType: 'refund',
        transactionAmount: Math.round(refundAmount * 100) / 100,
        description: `Refund for canceled item: ${items.name} (Order: ${orderedProducts.orderId})`
      };

      if (wallet) {
        wallet.balance += refundAmount
        wallet.transactionHistory.push(transaction);
        await wallet.save();
      } else {
        const newWallet = new Wallet({
          userId: orderedProducts.userId,
          balance: refundAmount,
          transactionHistory: [transaction]
        });
        await newWallet.save();
      }
    }

    await orderedProducts.save();

    // Check if all items are now canceled
    const allProductsCancelled = orderedProducts.orderedItems.every((p => p.cancelStatus == 'canceled'))
    if (allProductsCancelled) {
      orderedProducts.status = ORDER_STATUS.CANCELED
      await orderedProducts.save()
    }
    return res.status(HTTP_STATUS.OK).json({ message: MESSAGES.ITEM_CANCELED });

  } catch (error) {
    console.log("Error in orderCancel:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_ERROR });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.session.user;
    const cancelledOrder = await Order.findOneAndUpdate({ _id: orderId, userId }, { status: "Canceled" }, { new: true });

    if (!cancelledOrder) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    for (let item of cancelledOrder.orderedItems) {
      const size = await Size.findOne({ product: item.product, size: item.size })
      size.quantity += item.quantity
      await size.save()
      item.cancelStatus = 'canceled'
    }


    // Refund to wallet if payment method is not COD
    if (cancelledOrder.paymentMethod !== 'COD' && cancelledOrder.paymentStatus != 'Pending') {
      const wallet = await Wallet.findOne({ userId: cancelledOrder.userId });
      const refundAmount = cancelledOrder.finalAmount || cancelledOrder.totalPrice;
      if (wallet) {
        wallet.balance += refundAmount;
        wallet.transactionHistory.push({
          transactionType: 'refund',
          transactionAmount: refundAmount,
          description: `Refund for cancelled order ${cancelledOrder._id}`
        });
        await wallet.save();
      } else {
        const newWallet = new Wallet({
          userId: cancelledOrder.userId,
          balance: refundAmount,
          transactionHistory: [{
            transactionType: 'refund',
            transactionAmount: refundAmount,
            description: `Refund for cancelled order ${cancelledOrder._id}`
          }]
        });
        await newWallet.save();
      }
    }

    await cancelledOrder.save();
    return res.status(200).json({
      success: true,
      message: "Order canceled successfully"
    });

  } catch (error) {
    console.log("error in " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const returnOrder = async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.session.user
    const orders = await Order.findOne({ 'orderedItems._id': productId, userId })
    const orderedIndex = orders.orderedItems.findIndex((item) => item._id.toString() == productId)
    if (orderedIndex == -1) {
      return res.status(401).json({ message: "Item not found" })
    }
    const returnOrder = orders.orderedItems[orderedIndex]
    if (returnOrder.returnStatus !== 'Not Requested' || returnOrder.cancelStatus == 'canceled') {
      return res.status(400).json({ message: 'Return already requested for this product' });
    }

    returnOrder.returnStatus = 'Requested'

    await orders.save()
    res.status(200).json({ message: 'Return request submitted successfully' });
  } catch (error) {
    console.log("the error is" + error)
  }
}

//update order status cancel payment 


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = status;
    await order.save();

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

const createPdf = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.user;
    const order = await Order.findOne({ orderId: orderId, userId });
    if (!order) {
      return res.status(404).send("Order not found or unauthorized");
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
        .text(`₹${(item.price / item.quantity).toFixed(2)}`, 300, position)
        .text(`₹${(item.price).toFixed(2)}`, 400, position);
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
      .text(`₹${order.finalAmount ? order.finalAmount : order.totalPrice.toFixed(2)}`, 400, position);
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
}

export { orders, viewOrder, orderCancel, returnOrder, cancelOrder, updateOrderStatus, createPdf }