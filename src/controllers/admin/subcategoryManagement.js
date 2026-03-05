import { Category } from "../../models/categoriesSchema.js"
import { Subcategory } from "../../models/subcategorySchema.js"
import { HTTP_STATUS, MESSAGES } from "../../constants.js";
import { subcategoryRepository } from "../../repositories/subcategoryRepository.js";
const subcategoryManagement = async (req, res) => {
    try {
        let search = req.query.search || "";
        let query = search ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        } : {};

        let page = parseInt(req.query.page) || 1;
        let limit = 4;
        let subcategory = await subcategoryRepository.findSubcategories(query, page, limit);
        let count = await subcategoryRepository.countSubcategories(query);
        let totalpages = Math.ceil(count / limit);
        return res.render('admin/subcategory', { subcategory, search, currentPage: page, totalpages })
    } catch (error) {
        return res.render('admin/pageNotFound')
    }

}

const subcategory = async (req, res) => {
    try {
        console.log('hello')
        console.log('Request body:', req.body); // Log the request body
        const { name, description } = req.body
        const existingSub = await subcategoryRepository.findSubcategoryByName(name)
        if (existingSub) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "subcategory already exists" })
        }

        const newSub = new Subcategory({ name, description })
        await newSub.save()
        return res.status(HTTP_STATUS.OK).json({ message: "successfully subcategory addedd" })
    } catch (error) {
        console.log(error)
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.INTERNAL_ERROR });

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
        const subcategory = await subcategoryRepository.findSubcategoryById(id)
        if (!subcategory) {
            return res.status(HTTP_STATUS.NOT_FOUND).send(MESSAGES.NOT_FOUND)
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
        const existingCategory = await subcategoryRepository.findSubcategoryByName(categoryName, id)
        if (existingCategory) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Subcategory already exists" })
        }
        const updatesubCategory = await Subcategory.findByIdAndUpdate(id, {
            name: categoryName,
            description
        }, { new: true })
        if (updatesubCategory) {
            res.redirect('/admin/subcategory')
        } else {
            res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        }
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.INTERNAL_ERROR })
    }
}
export { subcategoryManagement, subcategory, isList, unList, subedit, editSubcategory }

