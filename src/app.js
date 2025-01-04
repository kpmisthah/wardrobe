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


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true 
}))

//Built in middlewares
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static('public'))



app.use(passport.initialize())
app.use(passport.session())
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




