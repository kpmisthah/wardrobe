import express from "express"
import  {loadHome,loadError,loadShoppingPage} from "../controllers/user/userController.js"
import { productDetails } from "../controllers/user/productController.js"
import { userAuth , userLogin} from "../middlewares/userAuth.js"
const router = express.Router()
//home page
router.get('/',loadHome)
router.get('/notfound',loadError)

//shopping page
router.get('/shop',userAuth,loadShoppingPage)

//product detail page
router.get('/productDetails',productDetails)
export default router