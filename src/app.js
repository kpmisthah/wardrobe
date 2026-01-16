import express from "express"
import dotenv from "dotenv"
import connectDb from "./db/index.js";
import cors from "cors"
import path from 'path'
import { fileURLToPath } from 'url';
import session from "express-session"
import userRouter from './routes/userRouter.js'
import authRouter from './routes/authRoutes.js'
import adminRouter from './routes/adminRouter.js'
import{passport} from './db/passport.js'
// import { cartCountMiddleware } from "./middlewares/cart.js";
// import { wishlistCountMiddleware } from "./middlewares/cart.js";

dotenv.config()
const PORT = process.env.PORT;
const app = express()

//db connction success aayaale app listen cheythaal mathi
 connectDb()
.then(()=>{
    app.listen(PORT,()=>{
        console.log("server is running");
        
    })
})
.catch(err=>{
    console.log("Mongodb error",err);
    
})
//Built in middlewares
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static('public'))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// //session
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())
// app.use(cartCountMiddleware)
// app.use(wishlistCountMiddleware)
/*Security: Sometimes, sensitive data (like personal or session-related information)
 should never be cached to avoid the risk of exposing it if someone else uses the same browser.*/

 app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})



//ejs settings
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.set('view engine', 'ejs')
// app.set('views',[path.join(__dirname,'views/admin'),path.join(__dirname,'views/user')])
app.set('views', path.join(__dirname, 'views'));
app.use('/view-order', express.static(path.join(__dirname, 'public')));

app.use('/',userRouter)
app.use('/',authRouter)
app.use('/admin',adminRouter)




// Restart trigger Thu Jan 15 19:04:47 IST 2026
// Restart trigger Thu Jan 15 19:07:48 IST 2026
// Restart trigger Thu Jan 15 20:16:59 IST 2026
// Restart trigger Thu Jan 15 20:19:37 IST 2026
// Restart trigger Thu Jan 15 20:38:31 IST 2026
// Restart trigger Thu Jan 15 20:41:07 IST 2026
// Restart trigger Thu Jan 15 20:50:55 IST 2026
// Restart trigger Thu Jan 15 20:56:15 IST 2026
// Restart trigger Thu Jan 15 21:00:01 IST 2026
// Restart trigger Thu Jan 15 21:04:51 IST 2026
// Restart trigger Thu Jan 15 21:07:06 IST 2026
// Restart trigger Thu Jan 15 21:11:21 IST 2026
// Restart trigger Thu Jan 15 21:14:33 IST 2026
// Restart trigger Thu Jan 15 21:29:45 IST 2026
// Restart trigger Thu Jan 15 21:33:10 IST 2026
// Restart trigger Thu Jan 15 21:37:10 IST 2026
// Restart trigger Thu Jan 15 21:39:08 IST 2026
// Restart trigger Fri Jan 16 08:32:51 IST 2026
// Restart trigger Fri Jan 16 12:07:57 IST 2026
// Restart trigger Fri Jan 16 14:32:14 IST 2026
// Restart trigger Fri Jan 16 14:54:50 IST 2026
