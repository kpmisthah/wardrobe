import { User } from "../../models/userSchema.js"
import { Address } from "../../models/addressSchema.js"
const loadCheckout = async(req,res)=>{
    try {
        let user = req.session.user
        let userAddress = await Address.findOne({userId:user})
        if(!userAddress ){
            return res.redirect('/getAddress')
        }
        if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/checkout',{user:userData,address:userAddress.address })
        }
        
    } catch (error) {
        
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
        const userAddress = await Address.findOne({userId})
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
export{loadCheckout,getEditAddressPage,editAddress}