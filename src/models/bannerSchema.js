import mongoose,{Schema}from "mongoose"
const bannerSchema = new Schema({
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    link:{
        type:String
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    }
},{timestamps:true})

export const Banner = mongoose.model('Banner',bannerSchema)