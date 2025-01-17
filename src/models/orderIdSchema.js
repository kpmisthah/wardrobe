import { v4 as uuidv4 } from 'uuid';
import mongoose,{Schema} from 'mongoose'

const orderIdSchema = new Schema({
    orderId:{
        type:String,
        default:()=>uuidv4(),
        // required:true
    },
    orderedItems:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            // required:true
        },
        quantity:{
            type:Number,
            // required:true
        },
        price:{
            type:Number,
            default:0
        },
        size: { 
            type: String, 
            required: true 
        },
        name:{
            type:String,
            required:true
        },
        returnStatus: {
            type: String,
            enum: ['Not Requested', 'Requested', 'Approved', 'Rejected'],
            default: 'Not Requested',
          },
          couponCode:[{
            type:String,
            required:false
          }],
          cancelStatus:{
            type:String,
            enum:['completed','canceled'],
            default:'completed'
          }
       
    }],
    totalPrice:{
        type:Number,
        // required:true
    },
    discount:{
        type:Number,
        default:0
    },
    finalAmount:{
        type:Number,
        // required:true
    },
    address:{
        name:{
            type:String,
            required:true
          },
          email:{
            type:String,
            required:true,
          },
          phone:{
            type:Number,
            required:true
          },
          city:{
            type:String,
            required:true
          },
          zipCode:{
            type:Number,
            required:true
          },
          houseNumber:{
            type:String,
            required:true
          },
          district:{
            type:String,
            required:true
          },
          state:{
            type:String,
            required:true
          },
          isDefault:{
            type:Boolean,
            default:false
          }
    }, 
    invoiceDate:{
        type:Date,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String,
       required:true,
       enum:['Pending','Shipped','Delivered',"Completed","Return Request","Returned","Canceled"]
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Failed', 'Success'],
      default: 'PENDING'
    },

},{timestamps:true})

export const Order = mongoose.model('Order',orderIdSchema)