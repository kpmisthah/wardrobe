import mongoose,{Schema} from 'mongoose'

const brandSchema = new Schema({
    brandName:{
        type:String,
        required:true
    },
    brandImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:String,
        default:false
    }
},{timestamps:true})

export const Brand = mongoose.model('Brand',brandSchema)
