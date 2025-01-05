import mongoose,{Schema} from 'mongoose'
const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    productImage:{
        type:[String],
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Subcategory", // Link to Subcategory schema
        required: true,
    },
    sizeOptions:[{
        type:Schema.Types.ObjectId,
        ref:'Size',
        required:true
    }],
    isStock:{
        type:Boolean,
        default:true
    },
    colorOption:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['Available','out of stock'],
        default:"Available"

    }

},{timestamps:true})

export const Product = mongoose.model('Product',productSchema)