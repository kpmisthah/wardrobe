const isAuthenticated = (req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        return res.redirect('/admin/login')
    }
    next()
}

const isLogin = (req,res,next)=>{
    if(!req.session.admin){
        next()
    }else{
       return res.redirect('/admin/dashboard')
    }
    next()
}

export{isAuthenticated,isLogin}