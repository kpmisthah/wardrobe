import express from "express"
import  {loadHome,loadError} from "../controllers/user/userController.js"

const router = express.Router()

router.get('/',loadHome)
router.get('/notfound',loadError)
export default router