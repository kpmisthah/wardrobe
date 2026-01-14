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
router.put('/update-profile', profileUpdate)
router.get('/getAddress', userAuth, block, getAddress)
router.get('/add-address', block, userAuth, addAddress)
router.post('/address', address)
router.get('/edit/:id', block, getEditPage)
router.put('/edit/:id', edit)
router.delete('/delete/:id', deleteAddress)
//cart page
router.get('/cart', block, userAuth, loadCart)
router.post('/add-to-cart', cart)
router.post('/validate-cart-stock', validateCartStock);
router.delete('/cart/remove/:productId', deleteItem);
//increment and decrement
router.post('/decrement', dec)
router.post('/increment', inc)
router.get('/cart/count', cartcount)

//checkout page
router.get('/checkout', block, loadCheckout)
router.get('/editted/:id', block, getEditAddressPage)
router.put('/editted/:id', editAddress)
router.get('/add-checkoutaddress', block, loadAddcheckoutaddress)
router.post('/add-checkout-address', addcheckoutAddress)
//place order
router.post('/place-order', placeOrder)
router.post('/apply-coupon', applyCoupon)
router.get('/order-confirmation', orderConfirm)
router.post('/remove-coupon', removeCoupon)
//view-orderpage
router.get('/orders', block, userAuth, orders)
router.get('/user/view-order/:orderid', block, viewOrder)
router.post('/order-cancel', orderCancel)
router.post('/order/cancel', cancelOrder)
router.post('/return-order', returnOrder)
router.get('/orderdetails/download/pdf/:orderId', createPdf)
//otp-page
router.get('/otp', otpVerification)
router.post('/verify-otp', verifyOtps)
router.post('/verify-otp', verifyOtps)
//wishlist
router.get('/wishlist', block, userAuth, loadWishlist)
router.post('/add-to-wishlist', addToWishlist)
router.post('/add-cart', wishlistToCart)
router.delete('/remove-wishlist/:productId', removeWishlist)
//wallet
router.get('/wallet', block, loadWallet)
router.post('/place-order/wallet', wallet)
//Invoice download
router.get('/order/download/pdf/:orderId', generatePdf)
//razorpay
router.post('/create-order', rzpOrder)
router.post('/create-pending-order', createPendingOrder)
router.post('/confirm-order', saveOrder)
router.post('/update-order-status', updateOrderStatus);

//retry-payment
router.post('/retry-payment', retryPayment)
router.post('/complete-retry-payment', completeRetryPayment);

export default router