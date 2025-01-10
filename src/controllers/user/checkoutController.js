import { User } from "../../models/userSchema.js"
import { Address } from "../../models/addressSchema.js"
import {Cart} from '../../models/cartSchema.js'
import { Order } from "../../models/orderIdSchema.js"
import { Coupon } from "../../models/couponSchema.js"


const loadCheckout = async(req,res)=>{
    try {
        let user = req.session.user
        let userAddress = await Address.findOne({userId:user})
        const cart = await Cart.findOne({userId:user}).populate('items.product')
        const coupon = await Coupon.find()
        if(!userAddress ){
            return res.redirect('/getAddress')
        }
        if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/checkout',{user:userData,address:userAddress.address ,cart,coupon})
        }
        
    } catch (error) {
        console.log(error)
    }
}

const getEditAddressPage = async(req,res)=>{
    try {
        const{id} = req.params
        const userId = req.session.user
       const userAddress = await Address.findOne({userId})
       if(!userAddress){
        return res.redirect('/getAddress')
       }
       const address = userAddress.address.find((addr=>addr._id.toString() === id))
       if(!address){
        return res.redirect('/getAddress')
    }
        return res.render('user/edit-checkaddress',{address})
    } catch (error) {
        console.log("the eror"+error)
    }
}

const editAddress = async(req,res)=>{
    try {
        const {id} = req.params
        const userId = req.session.user
        const data = req.body
        await Address.findOneAndUpdate({userId,'address._id':id},{
            $set:{
                'address.$.name':data.name,
                'address.$.email':data.email,
                'address.$.phone':data.phone,
                'address.$.city':data.city,
                'address.$.zipCode':data.zipCode,
                'address.$.houseNumber':data.houseNumber,
                'address.$.district':data.district,
                'address.$.state':data.state,
            }
        
        })
        res.status(200).json({message:"data updated successfully"})
    } catch (error) {
        console.log("somethig went wrong",error)
    }
}

const loadAddcheckoutaddress = async(req,res)=>{
    try {
        return res.render('user/addCheckoutaddress')
    } catch (error) {
        console.log("The error is "+error)
    }
}

const addcheckoutAddress = async(req,res)=>{
    try {
        console.log("hello")
        let user = req.session.user
        const data = req.body
        // let user = await User.findOne({_id:userData})
        const userAddress = await Address.findOne({userId:user})
        console.log("Thee"+userAddress)
        if(userAddress){
            userAddress.address.push({
                name:data.name,
                email:data.email,
                phone:data.phone,
                city:data.city,
                zipCode:data.zipCode,
                state:data.state,
                houseNumber:data.houseNumber,
                district:data.district,
            })
            await userAddress.save()
            return res.status(200).json({message:"Address is addedd successfully"})
        }else{
            const newAddress = new Address({
                userId:user,
                address:[{
                    name:data.name,
                    email:data.email,
                    phone:data.phone,
                    city:data.city,
                    zipCode:data.zipCode,
                    state:data.state,
                    houseNumber:data.houseNumber,
                    district:data.district,
                }]
            })
            await newAddress.save()
            return res.status(200).json({message:"Address added successfully"})
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const placeOrder = async(req,res)=>{
    try {
        const{payment,addressId,couponCode} = req.body
        const userId = req.session.user
        const cart = await Cart.findOne({userId})
        const  address = await Address.findOne({userId})
        let coupon = await Coupon.findOne({code:couponCode,isActive:true})
        if (!coupon) {
            return res.status(400).json({ message: "Invalid or expired coupon" });
        }
        
     
        if(coupon.minPurchase>cart.bill){
            return res.status(400).json({message:"total price should be greater than minimum purchase"})
        }
        
        if (coupon.startDate > Date.now() || coupon.endDate < Date.now()) {
            return res.status(400).json({message: "Coupon is not valid"});
        }
        
              
        const orderedCoupon = await Order.findOne({userId,'orderedItems.couponCode':couponCode})
       if(orderedCoupon){
        return res.status(401).json({message:"coupon is already ordered"})
       }
        let discount = 0
        if(coupon.discountType == 'percentage'){
            discount = (cart.bill*coupon.discountValue)/100
        }else{
            discount = coupon.discountValue
        }
        console.log("Teh dicscount pricer is"+discount)

         
        const finalPrice = cart.bill - discount

        let orderedItems = []
        //to 
        // Add the size of particular product and manage the stock
        for(let item of cart.items){
            orderedItems.push({
                product: item.product,
                name: item.name,
                size: item.size,  
                quantity: item.quantity,
                price: item.price,
                couponCode:couponCode||null,
                returnStatus:'Not Requested'
            });

        }
     
        
        const newOrder = new Order({
            orderedItems,
            address: addressId,
            userId,
            paymentMethod: payment,
            status: "Pending", 
            totalPrice:cart.bill,
            discount,
            finalAmount:finalPrice,
            invoiceDate: new Date()
        });

        await newOrder.save()
        cart.items = [];
        cart.bill = 0;
        await cart.save();
        return res.status(200).json({ message: "Order placed successfully", redirectUrl: "/order-confirmation" });
    } catch (error) {
        console.log("The error is"+error)
    }
}

const saveOrder = async (req, res) => {
    try {
        let userId = req.session.user
        const {  addressId, couponCode, amount } = req.body;
        const cart = await Cart.findOne({userId})
        
        let coupon = await Coupon.findOne({code:couponCode,isActive:true})
        if (!coupon) {
            return res.status(400).json({ message: "Invalid or expired coupon" });
        }
        
     
        if(coupon.minPurchase>cart.bill){
            return res.status(400).json({message:"total price should be greater than minimum purchase"})
        }
        
        if (coupon.startDate > Date.now() || coupon.endDate < Date.now()) {
            return res.status(400).json({message: "Coupon is not valid"});
        }
        
              
        const orderedCoupon = await Order.findOne({userId,'orderedItems.couponCode':couponCode})
       if(orderedCoupon){
        return res.status(401).json({message:"coupon is already ordered"})
       }
        let discount = 0
        if(coupon.discountType == 'percentage'){
            discount = (cart.bill*coupon.discountValue)/100
        }else{
            discount = coupon.discountValue
        }
        console.log("Teh dicscount pricer is"+discount)

         
        const finalPrice = cart.bill - discount

        let orderedItems = []
        for(let item of cart.items){
            orderedItems.push({
                product: item.product,
                name: item.name,
                size: item.size,  
                quantity: item.quantity,
                price: item.price,
                couponCode:couponCode||null,
                returnStatus:'Not Requested'
            });

        }
    
        const newOrder = new Order({
            orderedItems,
            address: addressId,
            userId,
            paymentMethod: 'razorpay',
            status: "Pending", 
            totalPrice:cart.bill,
            discount,
            finalAmount:finalPrice,
            invoiceDate: new Date()
        });

        await newOrder.save();
        cart.items = [];
        cart.bill = 0;
        await cart.save();
        res.json({ status: 200, message: "Order saved successfully", redirectUrl: '/order-confirmation' });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Failed to save order" });
    }
};

// Backend controller for applying coupon
const applyCoupon = async(req, res) => {
    try {
        const { couponCode } = req.body
        const userId = req.session.user
        
       
        const cart = await Cart.findOne({ userId })
        if (!cart) {
            return res.status(400).json({ message: "Cart not found" })
        }
          
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true })
        
        if (!coupon) {
            return res.status(400).json({ message: "Invalid or expired coupon" })
        }

           //minpurchase
        if (coupon.minPurchase > cart.bill) {
            return res.status(400).json({
                message: `Minimum purchase amount of ₹${coupon.minPurchase} required`
            })
        }

       
        if (coupon.startDate > Date.now() || coupon.endDate < Date.now()) {
            return res.status(400).json({ message: "Coupon is not valid at this time" })
        }

      //oru coupon oru user ..oru user n same coupon 2 thavana add aakan patoola
        const existingOrder = await Order.findOne({
            userId,
            'orderedItems.couponCode': couponCode
        })
        
        if (existingOrder) {
            return res.status(400).json({ message: "You have already used this coupon" })
        }

        // Calculate discount
        let discount = 0
        if (coupon.discountType === 'percentage') {
            discount = (cart.bill * coupon.discountValue) / 100
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount
            }
        } else {
            discount = coupon.discountValue
        }
          //final amount
        const finalAmount = cart.bill - discount
        console.log("The final amount is"+finalAmount);
        
        return res.status(200).json({
            success: true,
            discount,
            finalAmount,
            message: "Coupon applied successfully"
        })

    } catch (error) {
        console.error("Error applying coupon:", error)
        return res.status(500).json({ 
            message: "Failed to apply coupon",
            error: error.message 
        })
    }
}

const orderConfirm = async(req,res)=>{
    try {
        const user = req.session.user
        const orders = await Order.findOne({userId:user})
        return res.render('user/orderconfirmed',{orders})
    } catch (error) {
        
    }
}
export{loadCheckout,getEditAddressPage,editAddress,loadAddcheckoutaddress,addcheckoutAddress,placeOrder,orderConfirm,applyCoupon,saveOrder}