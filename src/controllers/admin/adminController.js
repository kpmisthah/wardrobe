import {User} from '../../models/userSchema.js'
import bcrypt from "bcrypt"

const loginPage = async(req,res)=>{   
  res.render('admin/login') 
}

const login = async(req,res)=>{
    try {
        const{email,password} = req.body
        const admin =await User.findOne({email,isAdmin:1})
        if(!admin){
            return res.render('admin/login',{message:"Invalid credentials"})
        }
        const matchPassword = await bcrypt.compare(password,admin.password)
        if(!matchPassword){
            return res.render('admin/login',{message:"Invalid credentials"})
        }
        req.session.admin = admin._id
        res.redirect('/admin/dashboard')
        
    } catch (error) {
        console.log("Error");
        
    }

}



export{loginPage,login}