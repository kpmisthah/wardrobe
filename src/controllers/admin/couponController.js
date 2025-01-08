import { Coupon } from "../../models/couponSchema.js"

const laodCoupon = async(req,res)=>{
    try {
        const coupon = await Coupon.find()
        return res.render('admin/coupon',{coupon})
    } catch (error) {
        console.log("The error is "+error)
    }
}

const addcoupon = async(req,res)=>{
    try {
        return res.render('admin/couponAdd')
    } catch (error) {
        
    }
}

const createCoupon = async(req,res)=>{
    try {
        const { code, discountValue, minOrderValue, startDate, endDate, status,discountType } = req.body;
        const couponExist = await Coupon.findOne({code})
        if(couponExist){
            return res.status(400).json({message:"coupon is already exist"})
        }
        const newCoupon = new Coupon({code, discountValue, minOrderValue, startDate, endDate, status,discountType})
        await newCoupon.save()
        res.status(200).json({message:"coupon is added successfully"})
    } catch (error) {
        console.log("The erro is "+error)
        res.status(500).json({message:"internal server error"})
    }
}
export{laodCoupon,addcoupon,createCoupon}