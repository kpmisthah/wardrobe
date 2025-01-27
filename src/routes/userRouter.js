import express from "express"
import  {loadHome,loadError,loadShoppingPage,loadProfile,updateProfile,getAddress,addAddress,address,getEditPage,edit,deleteAddress,profileUpdate,otpVerification,verifyOtps, resendOtp} from "../controllers/user/userController.js"
import { loadCart,cart ,deleteItem,inc,dec} from "../controllers/user/cartController.js"
import { productDetails } from "../controllers/user/productController.js"
import {loadCheckout, getEditAddressPage,editAddress,loadAddcheckoutaddress,addcheckoutAddress,placeOrder,orderConfirm,applyCoupon,saveOrder,removeCoupon,generatePdf,retryPayment,completeRetryPayment,createPendingOrder} from '../controllers/user/checkoutController.js'
import { userAuth,block } from "../middlewares/userAuth.js"
import { viewOrder,orders,orderCancel,returnOrder,cancelOrder,updateOrderStatus,createPdf} from "../controllers/user/orderController.js"
import { loadWishlist,addToWishlist,wishlistToCart,removeWishlist } from "../controllers/user/wishlistController.js"
import { rzpOrder } from "../controllers/user/paymentController.js"
// import { handleReviewSubmission } from "../controllers/user/reviewConroller.js"
import { loadWallet ,wallet} from "../controllers/user/walletController.js"
const router = express.Router()
//home page
router.get('/',block,loadHome)
router.get('/notfound',loadError)

//shopping page

router.get('/shop',userAuth,block,loadShoppingPage)

//product detail page
router.get('/productDetails',userAuth,block,productDetails)
//review page
// router.post('/submit-review',handleReviewSubmission)
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
router.post('/remove-coupon',removeCoupon)
//view-orderpage
router.get('/orders',userAuth,orders)
router.get('/user/view-order/:orderid',viewOrder)
router.post('/order-cancel',orderCancel)
router.post('/order/cancel',cancelOrder)
router.post('/return-order',returnOrder)
router.get('/orderdetails/download/pdf/:orderId',createPdf)
//otp-page
router.get('/otp',otpVerification)
router.post('/verify-otp',verifyOtps)
router.post('/resend-otp',resendOtp)
//wishlist
router.get('/wishlist',userAuth,loadWishlist)
router.post('/add-to-wishlist',addToWishlist)
router.post('/add-cart',wishlistToCart)
router.delete('/remove-wishlist/:productId',removeWishlist)
//wallet
router.get('/wallet',loadWallet)
router.post('/place-order/wallet',wallet)
//Invoice download
router.get('/order/download/pdf/:orderId',generatePdf)
//razorpay
router.post('/create-order', rzpOrder)
router.post('/create-pending-order', createPendingOrder)
router.post('/confirm-order',saveOrder)
//retry-payment
router.post('/retry-payment',retryPayment)
router.post('/complete-retry-payment', completeRetryPayment);
router.post('/update-order-status', updateOrderStatus);

export default router