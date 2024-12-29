import dotenv from "dotenv"
dotenv.config()
import passport from "passport"
import {Strategy}from "passport-google-oauth20"
import { User } from "../models/userSchema.js"

console.log(process.env.GOOGLE_CLIENT_ID)
passport.use(new Strategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'/auth/google/callback'
},

async (accessToken,refreshToken,profile,done)=>{
    try {
        let user = await User.findOne({googleId:profile.id})
        if(user){
            return done(null,user)
        }else{
            user = new User({
                name:profile.displayName,
                email:profile.emails[0].value, 
                googleId:profile.id
            })
            await user.save()
            return done(null,user)
        }
    
    } catch (error) {
        return done(err,null)
    }

}
))
passport.serializeUser((user,done)=>{
    done(null,user.id)
})

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{
        done(null,user)
    })
    .catch(err=>{
        done(err,null)
    })
})

export{passport}