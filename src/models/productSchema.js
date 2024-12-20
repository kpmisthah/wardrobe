import mongoose,{Schema, trusted} from 'mongoose'



// wishlist and cart fields:
// A product should not have direct links 
// to a wishlist or cart. Instead, users
//  should have references to products 
//  in their wishlist/cart. Remove these 
//  fields:


const productSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
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
    stock:{
        type:Number,
        // required:true
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
    sizeOption:{
        type:[Number],
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    colorOption:{
        type:[String],
        required:true
    },
    // offer:{
    //     type:Schema.Types.ObjectId,
    //     ref:"Offer",
    //     required:false
    // }
    productOffer:{
        type:Number,
        default:0
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