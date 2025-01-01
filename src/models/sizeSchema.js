import mongoose,{Schema} from "mongoose";

const sizeSchema = new Schema({
    
    product: {
          type: Schema.Types.ObjectId,
          ref: "Product", // Links to the Product model
          required: true,
    },
    size:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    }
})

export const Size = mongoose.model('Size',sizeSchema)