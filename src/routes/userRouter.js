import express from "express"
import  {loadHome,loadError,loadShoppingPage,loadProfile,updateProfile,getAddress,addAddress,address,getEditPage,edit,deleteAddress} from "../controllers/user/userController.js"
import { loadCart,cart } from "../controllers/user/cartController.js"
import { productDetails } from "../controllers/user/productController.js"
import {loadCheckout, getEditAddressPage,editAddress,loadAddcheckoutaddress,addcheckoutAddress,placeOrder,orderConfirm} from '../controllers/user/checkoutController.js'
import { userAuth } from "../middlewares/userAuth.js"
import { viewOrder,orders,productCancel,emptyOrder } from "../controllers/user/orderController.js"
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
router.get('/updateProfile',userAuth,updateProfile)
router.get('/getAddress',userAuth,getAddress)
router.get('/add-address',userAuth,addAddress)
router.post('/address',address)
router.get('/edit/:id',getEditPage)
router.put('/edit/:id',edit)
router.delete('/delete/:id',deleteAddress)
//cart page
router.get('/cart',userAuth,loadCart)
router.post('/add-to-cart',cart)
//checkout page
router.get('/checkout',loadCheckout)
router.get('/editted/:id',getEditAddressPage)
router.put('/editted/:id',editAddress)
router.get('/add-checkoutaddress',loadAddcheckoutaddress)
router.post('/add-checkout-address',addcheckoutAddress)
//place order
router.post('/place-order',placeOrder)
router.get('/order-confirmation',orderConfirm)
//view-orderpage
router.get('/orders',userAuth,orders)
router.get('/user/view-order/:orderid',viewOrder)
router.delete('/order-cancel',productCancel)
router.get('/emptyOrder',emptyOrder)
export default router