import { Category } from "../../models/categoriesSchema.js"
import { Subcategory } from "../../models/subcategorySchema.js"
import { StatusCodes } from "../../utils/enums.js"
import { Messages } from "../../utils/messages.js"

const subcategoryManagement = async (req, res) => {
    try {
        let search = req.query.search || "";
        let query = search ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        } : {};

        //pagination
        let page = parseInt(req.query.page) || 1
        let limit = 4
        let subcategory = await Subcategory.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        let count = await Subcategory.find(query).countDocuments();
        let totalpages = Math.ceil(count / limit);

        return res.render('admin/subcategory', {
            subcategory,
            search,
            currentPage: page,
            totalpages
        })
    } catch (error) {
        return res.render('admin/pageNotFound')
    }

}

const subcategory = async (req, res) => {
    try {
        console.log('hello')
        console.log('Request body:', req.body);
        const { name, description } = req.body
        const existingSub = await Subcategory.findOne({ name })
        if (existingSub) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.SUBCATEGORY_EXISTS })
        }

        const newSub = new Subcategory({ name, description })
        await newSub.save()
        return res.status(StatusCodes.OK).json({ message: Messages.SUBCATEGORY_ADDED })
    } catch (error) {
        console.log(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVER_ERROR });

    }
}

const isList = async (req, res) => {
    try {
        const { id } = req.query
        await Subcategory.findByIdAndUpdate(id, { isListed: true }, { new: true })
        res.redirect('/admin/subcategory')

    } catch (error) {
        console.log(error)
    }
}
const unList = async (req, res) => {
    try {
        const { id } = req.query
        await Subcategory.findByIdAndUpdate(id, { isListed: false }, { new: true })
        res.redirect('/admin/subcategory')

    } catch (error) {
        console.log(error)
    }
}
const subedit = async (req, res) => {
    try {
        const { id } = req.query
        const subcategory = await Subcategory.findById(id)
        if (!subcategory) {
            return res.status(StatusCodes.NOT_FOUND).send(Messages.SUBCATEGORY_NOT_FOUND)
        }
        res.render('admin/edit-subcategory', { subcategory })
    } catch (error) {
        console.log("The error is " + error)
    }
}

const editSubcategory = async (req, res) => {
    try {
        const { id } = req.params
        const { categoryName, description } = req.body
        const existingCategory = await Subcategory.findOne({ name: categoryName })
        if (existingCategory) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.SUBCATEGORY_EDIT_EXISTS })
        }
        const updatesubCategory = await Subcategory.findByIdAndUpdate(id, {
            name: categoryName,
            description
        }, { new: true })
        if (updatesubCategory) {
            res.redirect('/admin/subcategory')
        } else {
            res.status(StatusCodes.NOT_FOUND).json({ error: Messages.CATEGORY_NOT_FOUND })
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVER_ERROR })
    }
}
export { subcategoryManagement, subcategory, isList, unList, subedit, editSubcategory }
