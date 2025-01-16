import { Wallet } from "../../models/walletSchema.js";
import { User } from "../../models/userSchema.js";
import { Cart } from "../../models/cartSchema.js";
import { Order } from "../../models/orderIdSchema.js";
import { Product } from "../../models/productSchema.js";
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
    console.log("wallet"+payment+'  '+'addressId'+addressId);
    const userId = req.session.user;
    const wallet =await Wallet.findOne({userId})
    console.log("noe the balance"+wallet.balance);
    
    const order = await Order.findOne({userId})
    let coupon_code = req.session.coupon;
    let final_amount = req.session.finalAmount;
    const discount_amount = req.session.discount;
    console.log("The wallet is"+wallet);
    console.log("The order is "+order);
    console.log("The coupon is"+coupon_code);
    console.log("The final amount is"+final_amount);
    console.log("the discount "+discount_amount);
    
    const cart = await Cart.findOne({ userId });
    console.log("The cart is"+cart);
    
    if(wallet.balance<order.finalAmount){
        return res.status(400).json({message:"Balance is insufficient"})
    }else{
        let orderedItems = [];
        for(let item of cart.items){
            orderedItems.push({
                Product:item.product,
                name:item.name,
                size:item.size,
                quantity:item.quantity,
                couponCode:coupon_code,
                price:item.price,
                returnStatus:'Not Requested'
            })
        }
        let totalPrice = cart.bill
        console.log("Teh total price"+totalPrice);
        
        const newOrder = new Order({
            orderedItems,
            address:addressId,
            userId,
            paymentMethod:payment,
            status:'Pending',
            totalPrice,
            finalAmount:final_amount||totalPrice,
            discount:discount_amount,
            invoiceDate:new Date()
        })
        await newOrder.save()
        wallet.balance -=order.finalAmount
        await wallet.save()
        console.log("wallet balance is"+wallet.balance);
        return res.status(200).json({message:'order placed successfully',redirectUrl:'/order-confirmation'})
        
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
    console.log("The error is "+error)
  }
};
export { loadWallet, wallet };