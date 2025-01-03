import express from "express"
const router = express.Router()
import { loginPage,login,dashboard } from "../controllers/admin/adminController.js"
import { customer,blockUser,unblockUser } from "../controllers/admin/customerController.js"
import { categoryManagement ,category,addCategoryOffer,removeCategoryOffer,isListed,unListed,edit,editCategory} from "../controllers/admin/categoryManagement.js"
import { subcategoryManagement ,subcategory,isList,unList,subedit,editSubcategory} from "../controllers/admin/subcategoryManagement.js"
import{brandController,addBrand,blockBrand,unblockBrand,deleteBrand} from "../controllers/admin/brandController.js"
import {getProductAddPage,addProducts, getProductPage ,blockProduct,unblockProduct,getEditProduct,editProduct,sizeManagement,addSize} from "../controllers/admin/productController.js"
import { uploadMulter,storage } from "../utils/multer.js" //intialise multer with a custom storage engine
import { isAuthenticated,isLogin } from "../middlewares/adminAuth.js"
const uploads = uploadMulter(storage)

router.get('/login',isLogin,loginPage)
router.get('/dashboard',isAuthenticated,dashboard)
router.post('/login',login)
//customer management
router.get('/customer',customer)
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
router.post('/edit-page/:id',isAuthenticated,editCategory)
//subcateogry management
router.get('/subcategory',subcategoryManagement)
router.post('/addsubcategory',subcategory)
router.get('/list',isList)
router.get('/unlist',unList)
router.get('/editted',subedit)
router.post('/edit-sub/:id',editSubcategory)
//size management
router.get('/size',sizeManagement)
router.post('/add-size',addSize)
//brand management
router.get('/brand',brandController)
router.post('/addBrand',uploads.single('image'),addBrand)
router.get('/blockBrand',blockBrand)
router.get('/unblockBrand',unblockBrand)
router.get('/deleteBrand',deleteBrand)
//product management
router.get('/addProducts',getProductAddPage)
router.post('/addProducts',uploads.array('images',4),addProducts)
router.get('/products',getProductPage)
// router.post('/addProduct',addProductOffer)
// router.post('/removeProduct',removeProductOffer)
router.get('/blockProduct',blockProduct)
router.get('/unblockProduct',unblockProduct)
router.get('/editProduct',getEditProduct)
router.post('/editProducts/:id',uploads.array('images',4),editProduct)


export default router