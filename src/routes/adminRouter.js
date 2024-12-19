import express from "express"
const router = express.Router()
import { loginPage,login,dashboard } from "../controllers/admin/adminController.js"
import { customer,blockUser,unblockUser } from "../controllers/admin/customerController.js"
import { categoryManagement ,category,addCategoryOffer,removeCategoryOffer,isListed,unListed} from "../controllers/admin/categoryManagement.js"

router.get('/login',loginPage)
router.get('/dashboard',dashboard)
router.post('/login',login)
router.get('/customers',customer)
router.get('/blockUser',blockUser)
router.get('/unblockUser',unblockUser)
router.get('/category',categoryManagement)
router.post('/addCategory',category) 
router.post('/addOffer',addCategoryOffer)
router.post('/removeOffer',removeCategoryOffer)
router.get('/listed',isListed)
router.get('/unlisted',unListed)
export default router