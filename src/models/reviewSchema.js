import mongoose,{Schema} from "mongoose";
const reviewSchema = new Schema({
    productId:{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    review:{
        type:String,
        required:true,
        minLength:10,
        maxLength:1000
    }
},{timestamps:true})

export const Review = mongoose.model('Review',reviewSchema)