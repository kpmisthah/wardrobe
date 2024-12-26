import mongoose,{Schema} from 'mongoose'

const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    isListed:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
        // required:true
    },
    categoryOffer:{
        type:Number,
        default:0
    }

},{timestamps:true})

export const Category = mongoose.model('Category',categorySchema)