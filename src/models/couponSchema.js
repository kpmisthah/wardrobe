import mongoose,{Schema} from "mongoose"

const couponSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{
        type:String,
        require:true,
        unique:true
    },
    expireOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:false
    },
    minPurchase:{
        type:Number,
        required:true
    },
    isList:{
        type:Boolean,
        default:true
    },
    couponCode:{
        type:String,
        required:true
    }
},{timestamps:true})

export const Coupon = mongoose.model('Coupon',couponSchema)