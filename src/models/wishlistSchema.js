import mongoose,{Schema} from 'mongoose'

const wishlistSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:[{
       productId:{
        type:Schema.Types.ObjectId
       },
       addedOn:{
        type:Date,
        default:Date.now
       }
    }]
},{timestamps:true})

export const Wishlist = mongoose.model('Wishlist',wishlistSchema)