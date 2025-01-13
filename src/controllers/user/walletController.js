import { Wallet } from "../../models/walletSchema.js" 
import { User } from "../../models/userSchema.js"
const loadWallet = async(req,res)=>{
    try {
        const user = req.session.user
        const wallet = await Wallet.findOne({userId:user})
        if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/wallet',{wallet,user:userData})
        }
        
    } catch (error) {
        console.log("The error is"+error);
        
    }
}
export{loadWallet}