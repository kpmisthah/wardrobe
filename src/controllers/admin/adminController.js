import {User} from '../../models/userSchema.js'
import bcrypt from "bcrypt"

const loginPage = async(req,res)=>{
    if(req.session.admin){
        res.redirect('admin/dashboard')
    }else{
        res.render('admin/login')
    }
    
}

const login = async(req,res)=>{
    try {
        const{name,password} = req.body
        const admin = User.findOne({isAdmin:true,name:User.name})
        if(admin){
            return res.render('admin/dashboard')
        }else{
            return res.redirect('admin/login',{message:'Invalid credentials'})
        }
    } catch (error) {
        
    }

}

const dashboard = async(req,res)=>{
    res.render('admin/dashboard')
}
export{loginPage,login,dashboard}