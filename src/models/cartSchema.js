import mongoose,{Schema} from "mongoose"
const cartSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    items:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        name:String,
        quantity:{
            type:Number,
            required:true,
            min:1,
            default:1
        },
        size: {
            type: String,  
            required: true
        },
        price:{
            type:Number,
            required:true
        },
        totalPrice:{
            type:Number,
            required:true
        }
    }],
    maxQtyPerPerson: Number,
    bill:{
        type:Number,
        required:true,
        default:0
    }
},{timestamps:true})

export const Cart = mongoose.model('Cart',cartSchema)