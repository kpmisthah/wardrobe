import express from "express"
import  {loadHome,loadError,loadShoppingPage} from "../controllers/user/userController.js"

const router = express.Router()
//home page
router.get('/',loadHome)
router.get('/notfound',loadError)

//shopping page
router.get('/shop',loadShoppingPage)
export default router