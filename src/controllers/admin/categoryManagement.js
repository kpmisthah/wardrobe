import { Category } from "../../models/categoriesSchema.js";
import { Product } from "../../models/productSchema.js";
import { HTTP_STATUS, MESSAGES } from "../../constants.js";
import { categoryRepository } from "../../repositories/categoryRepository.js";

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

    let category = await categoryRepository.findCategories(query, page, limit);
    let categoryCount = await categoryRepository.countCategories(query);
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
    const existingCategory = await categoryRepository.findCategoryByName(normalizedName);
    if (existingCategory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.CATEGORY_EXISTS });
    }
    const newCategory = new Category({ name: normalizedName, description });
    await newCategory.save();
    return res.json({ message: MESSAGES.CATEGORY_ADDED });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.INTERNAL_ERROR });
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const percentage = parseFloat(req.body.percentage);
    const categoryId = req.body.categoryId;

    if (!categoryId || categoryId.trim() === '') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: false,
        message: MESSAGES.OFFER_INVALID_CATEGORY,
      });
    }

    if (req.body.percentage === '' || req.body.percentage === null || isNaN(percentage) || percentage < 0 || percentage > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: false,
        message: MESSAGES.OFFER_INVALID_PERCENTAGE,
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGES.NOT_FOUND,
      });
    }
    category.categoryOffer = Math.abs(percentage)
    await category.save()
    const products = await Product.find({ category: categoryId });
    for (let product of products) {
      const discount = product.regularPrice * (percentage / 100)
      product.salePrice = product.regularPrice - discount
      await product.save()

    }
    res.json({ status: true });

  } catch (error) {
    console.log("The error is " + error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: false, message: MESSAGES.INTERNAL_ERROR });
  }
};

const removeCategoryOffer = async (req, res) => {
  try {
    // if (req.session.admin) {
    const categoryId = req.body.categoryId;
    const category = await categoryRepository.findCategoryById(categoryId);
    if (!category) {
      return res.json({ message: MESSAGES.NOT_FOUND })
    }
    category.categoryOffer = 0
    await category.save()
    const products = await Product.find({ category: categoryId })
    for (let product of products) {
      product.salePrice = product.regularPrice
      await product.save()
    }
    res.status(HTTP_STATUS.OK).json({ status: true, message: MESSAGES.OFFER_REMOVED })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ status: false, message: MESSAGES.INTERNAL_ERROR });
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
    const existingCategory = await categoryRepository.findCategoryByName(categoryName, id);
    if (existingCategory) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.CATEGORY_EXISTS })
    }
    const updateCategory = await Category.findByIdAndUpdate(id, {
      name: categoryName,
      description
    }, { new: true })
    if (updateCategory) {
      res.redirect('/admin/category')
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
    }
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.INTERNAL_ERROR })
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
