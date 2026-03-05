import express from "express"
import { loadHome, loadError, loadShoppingPage, loadProfile, updateProfile, getAddress, addAddress, address, getEditPage, edit, deleteAddress, profileUpdate, otpVerification, verifyOtps } from "../controllers/user/userController.js"
import { loadCart, cart, deleteItem, inc, dec, validateCartStock, cartcount } from "../controllers/user/cartController.js"
import { productDetails } from "../controllers/user/productController.js"
import { loadCheckout, getEditAddressPage, editAddress, loadAddcheckoutaddress, addcheckoutAddress, placeOrder, orderConfirm, applyCoupon, saveOrder, removeCoupon, generatePdf, retryPayment, completeRetryPayment, createPendingOrder } from '../controllers/user/checkoutController.js'
import { userAuth, block } from "../middlewares/userAuth.js"
import { viewOrder, orders, orderCancel, returnOrder, cancelOrder, updateOrderStatus, createPdf } from "../controllers/user/orderController.js"
import { loadWishlist, addToWishlist, wishlistToCart, removeWishlist } from "../controllers/user/wishlistController.js"
import { rzpOrder } from "../controllers/user/paymentController.js"
import { loadWallet, wallet } from "../controllers/user/walletController.js"
import { Cart } from "../models/cartSchema.js"
const router = express.Router()
//home page
router.get('/', block, loadHome)
router.get('/notfound', loadError)

//shopping page

router.get('/shop', userAuth, block, loadShoppingPage)

//product detail page
router.get('/productDetails', userAuth, block, productDetails)
//profile page
router.get('/myaccount', block, userAuth, loadProfile)
router.get('/updateProfile', block, userAuth, updateProfile)
router.put('/update-profile', userAuth, block, profileUpdate)
router.get('/getAddress', userAuth, block, getAddress)
router.get('/add-address', userAuth, block, addAddress)
router.post('/address', userAuth, block, address)
router.get('/edit/:id', userAuth, block, getEditPage)
router.put('/edit/:id', userAuth, block, edit)
router.delete('/delete/:id', userAuth, block, deleteAddress)
//cart page
router.get('/cart', userAuth, block, loadCart)
router.post('/add-to-cart', userAuth, block, cart)
router.post('/validate-cart-stock', userAuth, block, validateCartStock);
router.delete('/cart/remove/:productId', userAuth, block, deleteItem);
//increment and decrement
router.post('/decrement', userAuth, block, dec)
router.post('/increment', userAuth, block, inc)
router.get('/cart/count', cartcount)

//checkout page
router.get('/checkout', userAuth, block, loadCheckout)
router.get('/editted/:id', userAuth, block, getEditAddressPage)
router.put('/editted/:id', userAuth, block, editAddress)
router.get('/add-checkoutaddress', userAuth, block, loadAddcheckoutaddress)
router.post('/add-checkout-address', userAuth, block, addcheckoutAddress)
//place order
router.post('/place-order', userAuth, block, placeOrder)
router.post('/apply-coupon', userAuth, block, applyCoupon)
router.get('/order-confirmation', userAuth, block, orderConfirm)
router.post('/remove-coupon', userAuth, block, removeCoupon)
//view-orderpage
router.get('/orders', block, userAuth, orders)
router.get('/user/view-order/:orderid', block, userAuth, viewOrder)
router.post('/order-cancel', userAuth, block, orderCancel)
router.post('/order/cancel', userAuth, block, cancelOrder)
router.post('/return-order', userAuth, block, returnOrder)
router.get('/orderdetails/download/pdf/:orderId', userAuth, block, createPdf)
//otp-page
router.get('/otp', otpVerification)
router.post('/verify-otp', verifyOtps)
//wishlist
router.get('/wishlist', userAuth, block, loadWishlist)
router.post('/add-to-wishlist', userAuth, block, addToWishlist)
router.post('/add-cart', userAuth, block, wishlistToCart)
router.delete('/remove-wishlist/:productId', userAuth, block, removeWishlist)
//wallet
router.get('/wallet', block, loadWallet)
router.post('/place-order/wallet', wallet)
//Invoice download
router.get('/order/download/pdf/:orderId', userAuth, block, generatePdf)
//razorpay
router.post('/create-order', userAuth, block, rzpOrder)
router.post('/create-pending-order', userAuth, block, createPendingOrder)
router.post('/confirm-order', userAuth, block, saveOrder)
router.post('/update-order-status', userAuth, block, updateOrderStatus);

//retry-payment
router.post('/retry-payment', userAuth, block, retryPayment)
router.post('/complete-retry-payment', userAuth, block, completeRetryPayment);

export default router