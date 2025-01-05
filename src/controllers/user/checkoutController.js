import { User } from "../../models/userSchema.js"
import { Address } from "../../models/addressSchema.js"
import {Cart} from '../../models/cartSchema.js'
import { Order } from "../../models/orderIdSchema.js"


const loadCheckout = async(req,res)=>{
    try {
        let user = req.session.user
        let userAddress = await Address.findOne({userId:user})
        const cart = await Cart.findOne({userId:user}).populate('items.product')
        if(!userAddress ){
            return res.redirect('/getAddress')
        }
        if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/checkout',{user:userData,address:userAddress.address ,cart})
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
        const{payment,addressId} = req.body
        const userId = req.session.user
        const  address = await Address.findOne({userId})
        const cart = await Cart.findOne({userId})
        let orderedItems = []
        //to add the size of particular product and manage the stock
        for(let item of cart.items){
            orderedItems.push({
                product: item.product,
                name: item.name,
                size: item.size,  
                quantity: item.quantity,
                price: item.price,
                returnStatus:'Not Requested'
            });

        }
        const newOrder = new Order({
            orderedItems,
            address: addressId,
            userId,
            paymentMethod: payment,
            status: "Pending", // Default initial status
            totalPrice:cart.bill,
            invoiceDate: new Date(),
        });

        await newOrder.save()
        cart.items = [];
        cart.bill = 0;
        await cart.save();
        res.redirect('/order-confirmation')
    } catch (error) {
        console.log("The error is"+error)
    }
}

const orderConfirm = async(req,res)=>{
    try {
        const user = req.session.user
        const orders = await Order.findOne({userId:user})
        console.log("The alst order is"+orders)
        return res.render('user/orderconfirmed',{orders})
    } catch (error) {
        
    }
}
export{loadCheckout,getEditAddressPage,editAddress,loadAddcheckoutaddress,addcheckoutAddress,placeOrder,orderConfirm}