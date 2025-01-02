import mongoose,{Schema} from "mongoose"

const addressSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    address:[{
          name:{
            type:String,
            required:true
          },
          email:{
            type:String,
            required:true,
          },
          phone:{
            type:Number,
            required:true
          },
          city:{
            type:String,
            required:true
          },
          zipCode:{
            type:Number,
            required:true
          },
          // country:{
          //   type:String,
          //   required:true
          // },
          houseNumber:{
            type:String,
            required:true
          },
          district:{
            type:String,
            required:true
          },
          state:{
            type:String,
            required:true
          },
          isDefault:{
            type:Boolean,
            default:false
          }
    }]

})

export const Address = mongoose.model("Address",addressSchema)