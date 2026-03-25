import { User } from "../../models/userSchema.js"
import { StatusCodes } from "../../utils/enums.js"
import { Messages } from "../../utils/messages.js"

const customer = async (req, res) => {
    try {
        //search box implementation
        let search = req.query.search || ''
        let filter = { isAdmin: false, name: { $regex: search, $options: "i" } }
        //pagination
        let page = parseInt(req.query.page) || 1
        let limit = 3
        let user = await User.find(filter).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
        let count = await User.find(filter).countDocuments({ isAdmin: false })
        let totalpages = Math.ceil(count / limit)
        res.render('admin/customer', { userData: user, currentPage: page, totalpages, search })
    } catch (error) {
        console.log(error);

    }
}

const blockUser = async (req, res) => {
    try {
        const { id } = req.query
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } })

        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
        if (isAjax) {
            return res.status(StatusCodes.OK).json({ success: true, message: Messages.USER_BLOCKED });
        }
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: Messages.SERVER_ERROR });
    }

}

const unblockUser = async (req, res) => {
    try {
        const { id } = req.query
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } })

        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
        if (isAjax) {
            return res.status(StatusCodes.OK).json({ success: true, message: Messages.USER_UNBLOCKED });
        }
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: Messages.SERVER_ERROR });
    }

}
export { customer, blockUser, unblockUser }