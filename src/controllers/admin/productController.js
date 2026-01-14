import { Product } from "../../models/productSchema.js";
import { Category } from "../../models/categoriesSchema.js";
import { Subcategory } from "../../models/subcategorySchema.js";
import path from "path";
import sharp from "sharp";
import { Size } from "../../models/sizeSchema.js";
import fs from 'fs';


const getProductAddPage = async (req, res) => {
  try {
      //extract category  from dbs
      const category = await Category.find({ isListed: true });
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
    const productExist = await Product.findOne({
      name: products.productName, //ivide error adikkan chance ind
    });
    if (!productExist) {
      //images handle cheyyan empty array initialise cheyya
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
      //ividathe products form nn varunne aan req.body nn.
      const category = await Category.findById(products.category);
      const subcategory = await Subcategory.findById(products.subcategory);

      if (!category || !subcategory) {
        return res.status(400).join("Invalid category name");
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
        .status(400)
        .json("product already exist ,please try with another name");
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
      const productData = await Product.find(searchQuery)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate({ path: "category", select: "name" })
        .populate("sizeOptions");
      const count = await Product.countDocuments(searchQuery);
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
      const product = await Product.findOne({ _id: id }).populate('category').populate('subcategory').populate('sizeOptions');
      const category = await Category.find({ isListed: true});
      const subcategory = await Subcategory.find({ isListed: true});
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
      const existingProduct = await Product.findOne({
          name: data.productName,
          _id: { $ne: id },
      });

      if (existingProduct) {
          return res.status(400).json({
              error: "Product with this name already exists. please try with another name",
          });
      }

      let images = [];
      if (req.files && req.files.length > 0) {
          images = req.files.map((file) => file.filename);
      }

      const category = await Category.findOne({ name: data.category });
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
         
          updateFields.$push = {productImage:{$each:images}};
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
const deleteSingleImage = async(req,res)=>{
  try {
      
     const {imageNameToServer,productIdToServer} = req.body;
     const product = await Product.findByIdAndUpdate(productIdToServer,{$pull:{productImage:imageNameToServer}});
     const imagePath = path.join("public","uploads","re-image",imageNameToServer);
     if(fs.existsSync(imagePath)){
      await fs.unlinkSync(imagePath);
      console.log(`Image ${imageNameToServer} deleted successfully`);

     }else{
        console.log(`Image ${imageNameToServer} not found`);
     }
     res.send({status:true});

  } catch (error) {
      console.log("The delete error is"+error);
      
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
    //existing size
    const normalSize = size.toLowerCase();
    const existingSize = await Size.findOne({ size: normalSize, product });
    if (existingSize) {
      existingSize.quantity += parseInt(quantity);
      await existingSize.save();
      return res
        .status(200)
        .json({ message: "quantity is update successfully" });
    }

    //new size
    const newSize = new Size({
      product,
      size: normalSize,
      quantity,
    });
    await newSize.save();
    //update the size option push the new sizes into array of sizeOptions in Product schema
    await Product.findByIdAndUpdate(product, {
      $push: { sizeOptions: newSize._id },
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("The error is error" + error);
    // res.status(500).json({message:"Internal server error"})
  }
};
export {
  getProductAddPage,
  addProducts,
  getProductPage,
  // addProductOffer,removeProductOffer,
  blockProduct,
  unblockProduct,
  getEditProduct,
  editProduct,
  sizeManagement,
  addSize,
  deleteSingleImage
};
