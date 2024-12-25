import { Category } from "../../models/categoriesSchema.js";
import { Product } from "../../models/productSchema.js";

const categoryManagement = async (req, res) => {
  try {
    if (req.session.admin) {
      let page = parseInt(req.query.page || 1);
      let limit = 3;
      let category = await Category.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
      let categoryCount = await Category.find({}).countDocuments();
      let totalpages = Math.ceil(categoryCount / limit);

      res.render("admin/categorymanagement", {
        categoryData: category,
        totalpages,
        currentPage: page,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    res.render("admin/pageNotFound");
    console.log("The error is " + error);
  }
};

const category = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category is already exist" });
    }
    const newCategory = new Category({ name, description });
    await newCategory.save();
    return res.json({ message: "Successfully category added" });
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    if (req.session.admin) {
      const percentage = req.body.percentage;
      const categoryId = req.body.categoryId;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({
            message: "Category not found",
          });
      }
      category.categoryOffer = percentage
      await category.save()
      const products = await Product.find({ category: categoryId });
      for(let product of products){
        const discount = product.regularPrice*(percentage/100)
        product.salePrice = product.regularPrice - discount
        await product.save()
        
      }
      res.json({ status: true });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "internal server error" });
  }
};

const removeCategoryOffer = async (req, res) => {
  try {
    if (req.session.admin) {
      const categoryId = req.body.categoryId;
      const category = await Category.findById(categoryId)
      if(!category){
        res.json({message:"something went wrong"})
      }
      category.categoryOffer = 0
      await category.save()
      const products = await Product.find({category:categoryId})
      for(let product of products ){
        product.salePrice = product.regularPrice
        await product.save()
      }
      res.status(200).json({status:true,message:"Offer removed successfully"})
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const isListed = async (req, res) => {
  try {
    if (req.session.admin) {
      const { id } = req.query;
      await Category.findByIdAndUpdate(id, { isListed: true }, { new: true });
      res.redirect("/admin/category");
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const unListed = async (req, res) => {
  try {
    if (req.session.admin) {
      const { id } = req.query;
      await Category.findByIdAndUpdate(id, { isListed: false }, { new: true });
      res.redirect("/admin/category");
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
    res.status(500).redirect("/admin/category");
  }
};

const edit = async(req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
           const category =  await Category.findOne({_id:id})
          res.render('admin/edit-category',{category})

        }else{
            res.redirect('admin/login')
        }
    } catch (error) {

    }
}
const editCategory = async(req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.params
            const{categoryName,description} = req.body
            const existingCategory = await Category.findOne({name:categoryName})
            if(existingCategory){
                return res.status(400).json({error:"category exist pls choose another name"})
            }
            const updateCategory = await Category.findByIdAndUpdate(id,{
                name:categoryName,
                description
            },{new:true})
            //new true kodutha retrun docs immediate aayitt return allenki ithinte thott update okke ayyirikkun=m varunne
            if(updateCategory){
                res.redirect('/admin/category')
            }else{
                res.status(404).json({error:"Category not found"})
            }

        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.status(500).json({error:"Internal Server error"})
    }
}
export {
  categoryManagement,
  category,
  addCategoryOffer,
  removeCategoryOffer,
  isListed,
  unListed,
  edit,
  editCategory
};
