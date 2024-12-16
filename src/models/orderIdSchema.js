import { v4 as uuidv4 } from 'uuid';
import mongoose,{Schema} from 'mongoose'

const orderIdSchema = new Schema({
    orderId:{
        type:String,
        default:()=>uuidv4(),
        required:true
    },
    orderedItems:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            default:0
        },
       
    }],
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    finalAmount:{
        type:Number,
        required:true
    },
    address:{
        type:Schema.Types.ObjectId,
        ref:"Address",
        required:true
    },
    
    invoiceDate:{
        type:Date,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    //doubt
    // paymentId:{
    //     type:Schema.Types.ObjectId,
    //     required:true
    // },
    status:{
        type:String,
       required:true,
       enum:['Pending','Processing','Shipped','Delivered',"cancelled","Return Request","Returned"]
    },
    couponApplied:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Order = mongoose.model('Order',orderIdSchema)