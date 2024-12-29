import express from "express"
import  {loadHome,loadError,loadShoppingPage,loadProfile,orders,updateProfile,getAddress,addAddress,address,getEditPage,edit,deleteAddress} from "../controllers/user/userController.js"
import { productDetails } from "../controllers/user/productController.js"
import { userAuth } from "../middlewares/userAuth.js"
const router = express.Router()
//home page
router.get('/',loadHome)
router.get('/notfound',loadError)

//shopping page
router.get('/shop',userAuth,loadShoppingPage)

//product detail page
router.get('/productDetails',productDetails)
//profile page
router.get('/myaccount',userAuth,loadProfile)
router.get('/orders',orders)
router.get('/updateProfile',updateProfile)
router.get('/getAddress',getAddress)
router.get('/add-address',addAddress)
router.post('/address',address)
router.get('/edit/:id',getEditPage)
router.put('/edit/:id',edit)
router.delete('/delete/:id',deleteAddress)
export default router