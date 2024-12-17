import express from "express"
const router = express.Router()
import { loginPage,login,dashboard } from "../controllers/admin/adminController.js"

router.get('/login',loginPage)
router.get('/dashboard',dashboard)
router.post('/login',login)
export default router