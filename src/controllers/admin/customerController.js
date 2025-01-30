import {User} from "../../models/userSchema.js"

const customer = async(req,res) =>{
    try {
            //search box implementation
            let search = req.query.search||''
            let filter = {isAdmin:false,name:{$regex:search,$options:"i"}}
            //pagination
            let page = parseInt(req.query.page)||1
           let limit = 3
            let user = await User.find(filter).sort({createdAt:-1}).limit(limit).skip((page-1)*limit)
            let count = await User.find(filter).countDocuments({isAdmin:false})
            let totalpages = Math.ceil(count/limit)
            res.render('admin/customer',{userData:user,currentPage:page,totalpages,search})
    } catch (error) {
        console.log(error);
        
    }
}

const blockUser = async(req,res)=>{
    try {
        const{id} = req.query
        await User.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect('/admin/customer')
    } catch (error) {
       console.log(error);
       
    }

}

const unblockUser = async(req,res)=>{
    try {
        const{id} = req.query
        await User.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect('/admin/customer')
    } catch (error) {
        //404
    }

}
export{customer,blockUser,unblockUser}