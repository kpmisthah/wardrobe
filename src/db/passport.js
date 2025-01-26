import dotenv from "dotenv"
dotenv.config()
import passport from "passport"
import {Strategy}from "passport-google-oauth20"
import { User } from "../models/userSchema.js"

// passport.use(new Strategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:'https://wardrobe.zapto.org/auth/google/callback',
//     passReqToCallback: true
// }, async (accessToken, refreshToken, profile, done) => {
//     try {


//         let user = await User.findOne({ email: profile.emails[0].value });
        
//         if (user) {
//             // If user exists, ensure googleId is set
//             if (!user.googleId) {
//                 user.googleId = profile.id;
//                 await user.save();
//             }
//             return done(null, user);
//         } else {
//             // Create new user
//             const newUser = {
//                 name: profile.displayName,
//                 email: profile.emails[0].value,
//                 googleId: profile.id,
//                 isAdmin: false,
//                 isBlocked: false,
//                 referalCode: '', 
//                 redeemed: false
//             };

//             user = new User(newUser);
//             await user.save();
//             return done(null, user);
//         }
//     } catch (error) {
//         console.error('Google Strategy Error:', error);
//         return done(error, null);
//     }
// }));

// passport.serializeUser((user, done) => {
//     try {
//         done(null, user.id); // Use user.id instead of user._id
//     } catch (err) {
//         done(err, null);
//     }
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id)
//             .select('-password'); // Exclude password field
        
//         if (!user) {
//             return done(new Error('User not found'), null);
//         }
//         done(null, user);
//     } catch (err) {
//         console.error('Deserialization error:', err);
//         done(err, null);
//     }
// });

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://wardrobe.zapto.org/auth/google/callback',
    passReqToCallback: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verify if the user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);  
        } else {
            // If user does not exist, create a new user
            const newUser = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                isAdmin: false,
                isBlocked: false,
                referalCode: '',
                redeemed: false
            });

            await newUser.save();
            return done(null, newUser); 
        }
    } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error, null);  
    }
}));

passport.serializeUser((user, done) => {
    try {
        done(null, user.id);  
    } catch (err) {
        done(err, null);  
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return done(new Error('User not found'), null);
        }
        done(null, user); 
    } catch (err) {
        done(err, null); 
    }
});
 export{passport}