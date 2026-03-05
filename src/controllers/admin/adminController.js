import userRepository from '../../repositories/userRepository.js'
import bcrypt from "bcrypt"
import { HTTP_STATUS, MESSAGES } from "../../constants.js";

const loginPage = async (req, res) => {
    res.render('admin/login')
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await userRepository.findOne({ email, isAdmin: true })
        if (!admin) {
            return res.render('admin/login', { message: MESSAGES.INVALID_CREDENTIALS })
        }
        const matchPassword = await bcrypt.compare(password, admin.password)
        if (!matchPassword) {
            return res.render('admin/login', { message: MESSAGES.INVALID_CREDENTIALS })
        }
        req.session.admin = admin._id
        res.redirect('/admin/dashboard')

    } catch (error) {
        console.log("Error");

    }

}

const pageNotFound = async (req, res) => {
    return res.render('admin/pageNotFound')

}

export { loginPage, login, pageNotFound }