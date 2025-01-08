import mongoose,{Schema} from "mongoose"

const couponSchema = new Schema({
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true, 
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'], 
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number, 
      default: null,
    },
    minPurchase: {
      type: Number, 
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number, 
      default: null,
    },
    usedCount: {
      type: Number, 
      default: 0,
    },
    isActive: {
      type: Boolean, 
      default: true,
    },
  }, {
    timestamps: true, 
  });
  
export const Coupon = mongoose.model('Coupon',couponSchema)
// export const Coupon = mongoose.model('Coupon', couponSchema);


