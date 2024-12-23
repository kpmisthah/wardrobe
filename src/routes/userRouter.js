import express from "express"
import  {loadHome,loadError,loadShoppingPage} from "../controllers/user/userController.js"
import { productDetails } from "../controllers/user/productController.js"

const router = express.Router()
//home page
router.get('/',loadHome)
router.get('/notfound',loadError)

//shopping page
router.get('/shop',loadShoppingPage)

//product detail page
router.get('/productDetails',productDetails)
export default router