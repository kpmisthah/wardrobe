import { rzp } from "../../db/razorpay.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

// Creating an order
const rzpOrder = async (req, res) => {
    try {
        const { amount, addressId, payment } = req.body
        console.log("The amount is" + amount);

        const rzpOrder = await rzp.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt#${addressId}`,
            payment_capture: true,
            notes: {
                orderType: "Pre",
                paymentMethod: payment
            }
        });
        console.log("Razorpay Order Response:", rzpOrder);
        // Send the order ID back to the frontend for checkout
        res.json({ orderId: rzpOrder.id, razorpayKey: process.env.RAZORPAY_KEY_ID, });

    } catch (error) {
        console.error("Error creating order or subscription:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
    }

}




export { rzpOrder }