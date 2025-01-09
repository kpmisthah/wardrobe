import { rzp } from "../../db/razorpay.js";

// Creating an order
const rzpOrder = async(req,res)=>{
    try {
        const{ amount, addressId, payment} = req.body
        const rzpOrder = await rzp.orders.create({
            amount: amount * 100,  // Convert to paise (1 INR = 100 paise)
            currency: 'INR',
            receipt: `receipt#${addressId}`,  // Use a unique receipt ID
            payment_capture: true,
            notes: {
                orderType: "Pre",
                paymentMethod: payment
            }
        });
    
        // Send the order ID back to the frontend for checkout
        res.json({ orderId: rzpOrder.id,razorpayKey: process.env.RAZORPAY_KEY_ID,});
    
    } catch (error) {
        console.error("Error creating order or subscription:", error);
        res.status(500).send("An error occurred while processing the order or subscription.");
    }
    
}
export{rzpOrder}