import mongoose,{Schema} from "mongoose"

const addressSchema = mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    address:[{
        firstname:{
            type:String,
            required:true
          },
          lastname:{
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
          country:{
            type:String,
            required:true
          },
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
          }
    }]

})

export const Address = mongoose.model("Address",addressSchema)