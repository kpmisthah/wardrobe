import { Product } from "../../models/productSchema.js";
import { Category } from "../../models/categoriesSchema.js";
import { Subcategory } from "../../models/subcategorySchema.js";
import path from "path";
import sharp from "sharp";
import { Size } from "../../models/sizeSchema.js";
import fs from 'fs';
<<<<<<< HEAD
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";
=======
import { HTTP_STATUS, MESSAGES, ORDER_STATUS } from "../../constants.js";
import { productRepository } from "../../repositories/productRepository.js";
import { categoryRepository } from "../../repositories/categoryRepository.js";
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c


const getProductAddPage = async (req, res) => {
  try {
<<<<<<< HEAD
    const category = await Category.find({ isListed: true });
=======
    //extract category  from dbs
    const category = await categoryRepository.findCategories({ isListed: true }, 1, 100);
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c
    const subcategory = await Subcategory.find({ isListed: true });
    const size = await Size.find();
    res.render("admin/product-add", {
      category,
      subcategory,
      size,
    });
  } catch (error) {
    res.render("admin/pageNotFound");
  }
};

const addProducts = async (req, res) => {
  try {
    const products = req.body;
<<<<<<< HEAD
    const productExist = await Product.findOne({
      name: products.productName,
    });
=======
    const productExist = await productRepository.findDuplicateProduct(products.productName);
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c
    if (!productExist) {
      const images = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const originalImagePath = req.files[i].path;
          const resizedFileName = `resized-${req.files[i].filename}`;
          const resizedImagePath = path.join(
            "public",
            "uploads",
            "product-images",
            resizedFileName
          );
          await sharp(originalImagePath)
            .resize({ width: 440, height: 440 })
            .toFile(resizedImagePath);
          images.push(resizedFileName);
        }
      }
<<<<<<< HEAD
      const category = await Category.findById(products.category);
      const subcategory = await Subcategory.findById(products.subcategory);

      if (!category || !subcategory) {
        return res.status(StatusCodes.BAD_REQUEST).json(Messages.INVALID_CATEGORY);
=======
      //ividathe products form nn varunne aan req.body nn.
      const category = await categoryRepository.findCategoryById(products.category);
      const subcategory = await Subcategory.findById(products.subcategory);

      if (!category || !subcategory) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json("Invalid category name");
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c
      }
      const newProduct = new Product({
        name: products.productName,
        description: products.description,
        category: category._id,
        subcategory: subcategory._id,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        createOn: new Date(),
        brand: products.brand,
        colorOption: [products.color],
        productImage: images,
        sizeOptions: [],
        status: "Available",
      });
      await newProduct.save();
      return res.redirect("/admin/addProducts");
    } else {
      return res
<<<<<<< HEAD
        .status(StatusCodes.BAD_REQUEST)
        .json(Messages.PRODUCT_EXISTS);
=======
        .status(HTTP_STATUS.BAD_REQUEST)
        .json("product already exist ,please try with another name");
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c
    }
  } catch (error) {
    console.error("Error saving product", error);
  }
};

const getProductPage = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = 3;

    const searchQuery = {
      name: { $regex: search, $options: "i" },
    };
    const productData = await productRepository.findProducts(searchQuery, page, limit);
    const count = await productRepository.countProducts(searchQuery);
    const totalPages = Math.ceil(count / limit);
    res.render("admin/products", {
      data: productData,
      currentPage: page,
      totalPages,
      search,

    });
  } catch (error) {
    console.error(error);
  }
};

const blockProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/products");
  } catch (error) {
    res.redirect("onsd");
  }
};

const unblockProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
  }
};

const getEditProduct = async (req, res) => {
  try {

    const { id } = req.query;
    const product = await productRepository.findProductById(id);
    const category = await categoryRepository.findCategories({ isListed: true }, 1, 100);
    const subcategory = await Subcategory.find({ isListed: true });
    res.render("admin/edit-product", {
      product,
      category,
      subcategory,
    });

  } catch (error) {
    res.redirect("/pageNotFound");
  }
};
;

const editProduct = async (req, res) => {
  try {
    console.log(req.files);
    const { id } = req.params;
    const data = req.body;
    const existingProduct = await productRepository.findDuplicateProduct(data.productName, id);

    if (existingProduct) {
<<<<<<< HEAD
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: Messages.PRODUCT_EDIT_EXISTS,
=======
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Product with this name already exists. please try with another name",
>>>>>>> 59c24a1dd5608bbd67f5c4ab49d51a090e32e32c
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.filename);
    }

    const category = await categoryRepository.findCategoryByName(data.category);
    const subcategory = await Subcategory.findOne({ name: data.subcategory });

    const updateFields = {
      name: data.productName,
      description: data.descriptionData,
      category: category._id,
      subcategory: subcategory._id,
      regularPrice: data.regularPrice,
      salePrice: data.salePrice,
      color: data.color,
    };

    if (images.length > 0) {

      updateFields.$push = { productImage: { $each: images } };
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });

    if (data.sizes && data.quantities) {

      const sizes = Array.isArray(data.sizes) ? data.sizes : [data.sizes];
      const quantities = Array.isArray(data.quantities) ? data.quantities : [data.quantities];

      await Size.deleteMany({ product: id });

      const sizePromises = sizes.map((size, index) => {
        return Size.create({
          product: id,
          size: size,
          quantity: parseInt(quantities[index])
        });
      });

      const newSizes = await Promise.all(sizePromises);

      updatedProduct.sizeOptions = newSizes.map(size => size._id);
      await updatedProduct.save();
    }

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.redirect("/pageerror");
  }
};
const deleteSingleImage = async (req, res) => {
  try {

    const { imageNameToServer, productIdToServer } = req.body;
    const product = await Product.findByIdAndUpdate(productIdToServer, { $pull: { productImage: imageNameToServer } });
    const imagePath = path.join("public", "uploads", "re-image", imageNameToServer);
    if (fs.existsSync(imagePath)) {
      await fs.unlinkSync(imagePath);
      console.log(`Image ${imageNameToServer} deleted successfully`);

    } else {
      console.log(`Image ${imageNameToServer} not found`);
    }
    res.status(StatusCodes.OK).send({ status: true });

  } catch (error) {
    console.log("The delete error is" + error);

  }
}
const sizeManagement = async (req, res) => {
  try {
    const products = await Product.find();
    return res.render("admin/size", { products });
  } catch (error) {
    console.log("error");
  }
};
const addSize = async (req, res) => {
  try {
    const { product, size, quantity } = req.body;
    const normalSize = size.toLowerCase();
    const existingSize = await Size.findOne({ size: normalSize, product });
    if (existingSize) {
      existingSize.quantity += parseInt(quantity);
      await existingSize.save();
      return res
        .status(StatusCodes.OK)
        .json({ message: Messages.QUANTITY_UPDATED });
    }

    const newSize = new Size({
      product,
      size: normalSize,
      quantity,
    });
    await newSize.save();
    await Product.findByIdAndUpdate(product, {
      $push: { sizeOptions: newSize._id },
    });
    res.status(StatusCodes.OK).json({ message: Messages.SIZE_ADDED });
  } catch (error) {
    console.log("The error is error" + error);
  }
};
export {
  getProductAddPage,
  addProducts,
  getProductPage,
  blockProduct,
  unblockProduct,
  getEditProduct,
  editProduct,
  sizeManagement,
  addSize,
  deleteSingleImage
};
