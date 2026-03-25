import { User } from '../../models/userSchema.js'
import bcrypt from "bcrypt"
import { Messages } from "../../utils/messages.js"
import userRepository from "../../repositories/userRepository.js"
import { StatusCodes } from "../../utils/enums.js"

const loginPage = async (req, res) => {
    res.render('admin/login')
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await userRepository.findOne({ email, isAdmin: true })
        if (!admin) {
            return res.render('admin/login', { message: Messages.INVALID_CREDENTIALS })
        }
        const matchPassword = await bcrypt.compare(password, admin.password)
        if (!matchPassword) {
            return res.render('admin/login', { message: Messages.INVALID_CREDENTIALS })
        }
        req.session.admin = admin._id
        res.redirect('/admin/dashboard')

    } catch (error) {
        console.log("Error");

    }

}

const pageNotFound = async (req, res) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);

}

export { loginPage, login, pageNotFound }