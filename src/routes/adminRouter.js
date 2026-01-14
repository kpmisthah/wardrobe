import express from "express"
const router = express.Router()
import { loginPage,login,pageNotFound } from "../controllers/admin/adminController.js"
import { customer,blockUser,unblockUser } from "../controllers/admin/customerController.js"
import { categoryManagement ,category,addCategoryOffer,removeCategoryOffer,isListed,unListed,edit,editCategory} from "../controllers/admin/categoryManagement.js"
import { subcategoryManagement ,subcategory,isList,unList,subedit,editSubcategory} from "../controllers/admin/subcategoryManagement.js"
import {getProductAddPage,addProducts, getProductPage ,blockProduct,unblockProduct,getEditProduct,editProduct,sizeManagement,addSize,deleteSingleImage} from "../controllers/admin/productController.js"
import { orderList,orderStatus,handleReturn ,orderCancelled,viewOrders} from "../controllers/admin/orderController.js"
import { laodCoupon,addcoupon,createCoupon ,editCoupon,geteditCoupon,deleteCoupon} from "../controllers/admin/couponController.js"
import { uploadMulter,storage } from "../utils/multer.js" //intialise multer with a custom storage engine
import { isAuthenticated,isLogin } from "../middlewares/adminAuth.js"
import {  loadDashboard,dashboard ,generatePdfReport,generateExcelReport} from "../controllers/admin/dashboardController.js"
const uploads = uploadMulter(storage)

router.get('/login',isLogin,loginPage)
router.post('/login',login)
router.get('/pageNotFound',pageNotFound)
//customer management
router.get('/customer',isAuthenticated,customer)
router.get('/blockUser',blockUser)
router.get('/unblockUser',unblockUser)
//category management
router.get('/category',isAuthenticated,categoryManagement)
router.post('/addCategory',category) 
router.post('/addOffer',addCategoryOffer)
router.post('/removeOffer',removeCategoryOffer)
router.get('/listed',isListed)
router.get('/unlisted',unListed)
router.get('/edit',isAuthenticated,edit)
router.post('/edit-page/:id',isAuthenticated,editCategory)
//subcateogry management
router.get('/subcategory',isAuthenticated,subcategoryManagement)
router.post('/addsubcategory',subcategory)
router.get('/list',isList)
router.get('/unlist',unList)
router.get('/editted',subedit)
router.post('/edit-sub/:id',editSubcategory)
//size management
router.get('/size',isAuthenticated,sizeManagement)
router.post('/add-size',addSize)

//product management
router.get('/addProducts',isAuthenticated,getProductAddPage)
router.post('/addProducts',uploads.array('images',4),addProducts)
router.get('/dashboard/:id',isAuthenticated ,loadDashboard)
router.get('/products',isAuthenticated,getProductPage)
router.get('/blockProduct',blockProduct)
router.get('/unblockProduct',unblockProduct)
router.get('/editProduct',isAuthenticated,getEditProduct)
router.post('/deleteImage',deleteSingleImage)
router.post('/editProducts/:id',uploads.array('images',4),editProduct)
//ordermanagement
router.get('/orderList',isAuthenticated,orderList)
router.post('/order-status',orderStatus)
router.post('/handleReturn',handleReturn)
router.post('/cancelorder/',orderCancelled)
router.get('/view-orders/:orderid',viewOrders)
//coupon management
router.get('/coupon',isAuthenticated,laodCoupon)
router.get('/addCoupon',isAuthenticated,addcoupon)
router.post('/coupon',createCoupon)
router.get('/editCoupon/:edit',isAuthenticated,geteditCoupon)
router.put('/editCoupon/:edit',editCoupon)
router.delete('/deleteCoupon/:id',deleteCoupon)

//dashboard
router.get('/dashboard',isAuthenticated ,loadDashboard)
router.post('/dashboard',dashboard)
router.get('/dashboard/download/pdf', generatePdfReport);
router.get('/dashboard/download/excel', generateExcelReport);

export default router

