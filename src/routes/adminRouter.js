import express from "express"
const router = express.Router()
import { loginPage,login,dashboard } from "../controllers/admin/adminController.js"
import { customer,blockUser,unblockUser } from "../controllers/admin/customerController.js"
import { categoryManagement ,category,addCategoryOffer,removeCategoryOffer,isListed,unListed,edit,editCategory} from "../controllers/admin/categoryManagement.js"
import{brandController,addBrand} from "../controllers/admin/brandController.js"
import multer from 'multer'
import { storage } from "../utils/multer.js"
const uploads = multer({ storage: storage });//intialise multer with a custo storage engine


router.get('/login',loginPage)
router.get('/dashboard',dashboard)
router.post('/login',login)
//customer management
router.get('/customers',customer)
router.get('/blockUser',blockUser)
router.get('/unblockUser',unblockUser)
//category management
router.get('/category',categoryManagement)
router.post('/addCategory',category) 
router.post('/addOffer',addCategoryOffer)
router.post('/removeOffer',removeCategoryOffer)
router.get('/listed',isListed)
router.get('/unlisted',unListed)
router.get('/edit',edit)
router.post('/edit-page/:id',editCategory)
//brand management
router.get('/brand',brandController)
router.post('/addBrand',uploads.single('image'),addBrand)
export default router