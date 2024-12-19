import {User} from '../../models/userSchema.js'
import bcrypt from "bcrypt"

const loginPage = async(req,res)=>{
    const ad = req.session.admin    
    if(req.session.admin){
       
        res.redirect('/admin/dashboard')
    }else{
        console.log("The adminid"+ad)
        res.render('admin/login')
    }
    
}

const login = async(req,res)=>{
    try {
        const{email,password} = req.body
        const admin =await User.findOne({email,isAdmin:1})
        console.log("The admin is "+admin)
        if(!admin){
            return res.render('admin/login',{message:"Invalid credentials"})
        }
        const matchPassword = await bcrypt.compare(password,admin.password)
        console.log("The match password is"+matchPassword)
        if(!matchPassword){
            return res.redirect('/admin/login')
        }
        req.session.admin = admin._id
        res.redirect('/admin/dashboard')
        console.log("The session is "+req.session.admin);
        
    } catch (error) {
        console.log("Error");
        
    }

}

const dashboard = async(req,res)=>{
    if(req.session.admin){
        res.render('admin/dashboard')
    }else{
        res.redirect('/admin/login')
    }
}


export{loginPage,login,dashboard}