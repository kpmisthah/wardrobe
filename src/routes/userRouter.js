import express from "express"
import  {loadHome,loadError,loadShoppingPage,loadProfile,updateProfile,getAddress,addAddress,address,getEditPage,edit,deleteAddress,profileUpdate,otpVerification,verifyOtp, resendOtp} from "../controllers/user/userController.js"
import { loadCart,cart ,deleteItem,inc,dec} from "../controllers/user/cartController.js"
import { productDetails } from "../controllers/user/productController.js"
import {loadCheckout, getEditAddressPage,editAddress,loadAddcheckoutaddress,addcheckoutAddress,placeOrder,orderConfirm,applyCoupon,saveOrder} from '../controllers/user/checkoutController.js'
import { userAuth } from "../middlewares/userAuth.js"
import { viewOrder,orders,orderCancel,returnOrder} from "../controllers/user/orderController.js"
import { loadWishlist,addToWishlist,wishlistToCart,removeWishlist } from "../controllers/user/wishlistController.js"
import { rzpOrder } from "../controllers/user/paymentController.js"
import { handleReviewSubmission } from "../controllers/user/reviewConroller.js"
const router = express.Router()
//home page
router.get('/',loadHome)
router.get('/notfound',loadError)

//shopping page
router.get('/shop',userAuth,loadShoppingPage)

//product detail page
router.get('/productDetails',productDetails)

//review page
router.post('/submit-review',handleReviewSubmission)
//profile page
router.get('/myaccount',userAuth,loadProfile)
router.get('/updateProfile',userAuth,updateProfile)
router.put('/update-profile',profileUpdate)
router.get('/getAddress',userAuth,getAddress)
router.get('/add-address',userAuth,addAddress)
router.post('/address',address)
router.get('/edit/:id',getEditPage)
router.put('/edit/:id',edit)
router.delete('/delete/:id',deleteAddress)
//cart page
router.get('/cart',userAuth,loadCart)
router.post('/add-to-cart',cart)
router.delete('/cart/remove/:productId',deleteItem);
//increment and decrement
router.post('/decrement',dec)
router.post('/increment',inc)
//checkout page
router.get('/checkout',loadCheckout)
router.get('/editted/:id',getEditAddressPage)
router.put('/editted/:id',editAddress)
router.get('/add-checkoutaddress',loadAddcheckoutaddress)
router.post('/add-checkout-address',addcheckoutAddress)
//place order
router.post('/place-order',placeOrder)
router.post('/apply-coupon',applyCoupon)
router.get('/order-confirmation',orderConfirm)
router.delete('/remove-coupon')
//view-orderpage
router.get('/orders',userAuth,orders)
router.get('/user/view-order/:orderid',viewOrder)
router.post('/order-cancel',orderCancel)
// router.get('/emptyOrder',emptyOrder)
router.post('/return-order',returnOrder)
//otp-page
router.get('/otp',otpVerification)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
//wishlist
router.get('/wishlist',userAuth,loadWishlist)
router.post('/add-to-wishlist',addToWishlist)
router.post('/add-cart',wishlistToCart)
router.delete('/remove-wishlist/:productId',removeWishlist)
//razorpay
router.post('/create-order', rzpOrder)
router.post('/save-order',saveOrder)
export default router