import userRepository from "../../repositories/userRepository.js";
import { HTTP_STATUS, MESSAGES } from "../../constants.js";

const customer = async (req, res) => {
    try {
        //search box implementation
        let search = req.query.search || ''
        let filter = { isAdmin: false, name: { $regex: search, $options: "i" } }
        //pagination
        let page = parseInt(req.query.page) || 1
        let limit = 3
        let user = await userRepository.findPaged(filter, page, limit);
        let count = await userRepository.count({ isAdmin: false, name: { $regex: search, $options: "i" } });
        let totalpages = Math.ceil(count / limit)
        res.render('admin/customer', { userData: user, currentPage: page, totalpages, search })
    } catch (error) {
        console.log(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_ERROR);
    }
}

const blockUser = async (req, res) => {
    try {
        const { id } = req.query
        await userRepository.updateById(id, { isBlocked: true })

        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
        if (isAjax) {
            return res.status(HTTP_STATUS.OK).json({ success: true, message: "User blocked successfully" });
        }
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
    }

}

const unblockUser = async (req, res) => {
    try {
        const { id } = req.query
        await userRepository.updateById(id, { isBlocked: false })

        const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);
        if (isAjax) {
            return res.status(HTTP_STATUS.OK).json({ success: true, message: "User unblocked successfully" });
        }
        res.redirect('/admin/customer')
    } catch (error) {
        console.log(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
    }

}
export { customer, blockUser, unblockUser }