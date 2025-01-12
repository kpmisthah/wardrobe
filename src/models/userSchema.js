import mongoose,{Schema} from "mongoose"


const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:false,  //single signup we didnt use password
        minlength:6,
    
    },
    phone:{
        type:String,
        required:false,
        trim:true,
        unique:true,
        sparse:true,
        default:null
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    googleId:{
        type:String,
         unique:true,
         sparse:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
   
    //What is this
    referalCode:{
        type:String
    },
    redeemed:{
        type:Boolean
    },
    redeemedUsers:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    searchHistory:[{
        category:{
            type:Schema.Types.ObjectId,
            ref:"Category"
        },
        brand:{
            type:String,    
        },
        searchOn:{
            type:Date,
            default:Date.now()
        }
    }]
},{timestamps:true})

export const User = mongoose.model("User",userSchema)