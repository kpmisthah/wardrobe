// import { User } from "../../models/userSchema.js"
const userAuth = async(req,res,next)=>{
    if(req.session.user){
        const user = await User.findById(req.session.user)
        if(user && !user.isBlocked){
            next()
        }else{
            req.session.destroy(err=>{
                console.error("error destroying session",err)
            })
            return res.render('user/login',{message:"User id blocked by admin"})
        }
        return next()
    }else{
        return res.redirect('/login')
    }
}
const userLogin = (req,res,next)=>{
    if(req.session.user){
        return res.redirect("/")
    }else{
        return next();
    }
}


export{userAuth,userLogin}  