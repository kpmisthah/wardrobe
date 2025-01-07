import {User} from "../../models/userSchema.js"

const customer = async(req,res) =>{
    try {
        if(req.session.admin){
            //search box implementation
            let search = req.query.search||''
            let filter = {isAdmin:false,name:{$regex:search,$options:"i"}}
            //pagination
            let page = parseInt(req.query.page)||1
           let limit = 3
            let user = await User.find(filter).limit(limit).skip((page-1)*limit)
            let count = await User.find(filter).countDocuments({isAdmin:false})
            let totalpages = Math.ceil(count/limit)
            res.render('admin/customer',{userData:user,currentPage:page,totalpages,search})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        
    }
}

const blockUser = async(req,res)=>{
    try {
        const{id} = req.query
        await User.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect('/admin/customer')
    } catch (error) {
        //404
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