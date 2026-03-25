import { Category } from "../../models/categoriesSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

const categoryManagement = async (req, res) => {
  try {
    let page = parseInt(req.query.page || 1);
    let limit = 4;
    let search = req.query.search || "";

    const query = search ? {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    } : {};

    let category = await Category.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    let categoryCount = await Category.find(query).countDocuments();
    let totalpages = Math.ceil(categoryCount / limit);

    return res.render("admin/categorymanagement", {
      categoryData: category,
      totalpages,
      currentPage: page,
      search
    });
  } catch (error) {
    return res.render("admin/pageNotFound");
  }
};

const category = async (req, res) => {
  try {
    const { name, description } = req.body;
    const normalizedName = name.toLowerCase();
    const existingCategory = await Category.findOne({ name: normalizedName });
    if (existingCategory) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.CATEGORY_EXISTS });
    }
    const newCategory = new Category({ name: normalizedName, description });
    await newCategory.save();
    return res.status(StatusCodes.OK).json({ message: Messages.CATEGORY_ADDED });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVER_ERROR });
  }
};

const isListed = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.findByIdAndUpdate(id, { isListed: true }, { new: true });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
  }
};

const unListed = async (req, res) => {
  try {
    const { id } = req.query;
    await Category.findByIdAndUpdate(id, { isListed: false }, { new: true });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).redirect("/admin/category");
  }
};

const edit = async (req, res) => {
  try {
    if (req.session.admin) {
      const { id } = req.query
      const category = await Category.findById(id)
      res.render('admin/edit-category', { category })

    } else {
      res.redirect('admin/login')
    }
  } catch (error) {
    console.log("the error is " + error)
  }
}
const editCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryName, description } = req.body
    const existingCategory = await Category.findOne({ name: categoryName })
    if (existingCategory) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: Messages.CATEGORY_EDIT_EXISTS })
    }
    const updateCategory = await Category.findByIdAndUpdate(id, {
      name: categoryName,
      description
    }, { new: true })
    if (updateCategory) {
      res.redirect('/admin/category')
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ error: Messages.CATEGORY_NOT_FOUND })
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVER_ERROR })
  }
}
export {
  categoryManagement,
  category,
  isListed,
  unListed,
  edit,
  editCategory,
};
