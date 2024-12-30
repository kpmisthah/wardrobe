import mongoose,{Schema} from "mongoose";
const subCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: false,
    },
    isListed:{
        type:Boolean,
        default:false
    }
});

export const Subcategory = mongoose.model('Subcategory',subCategorySchema)