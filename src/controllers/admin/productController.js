import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { Brand } from "../../models/brandSchema.js"
import fs from "fs"
import path from "path"
import sharp from "sharp"
import { error } from "console"
import { category } from "./categoryManagement.js"


const getProductAddPage = async(req,res)=>{

    try {
        if(req.session.admin){
    //extract category and brand from dbs
    const category = await Category.find({isListed:true})
    const brand = await Brand.find({isBlocked:false})
    res.render('admin/product-add',{
        category,brand
    })
    }else{
        res.redirect('/admin/login')
    }
    } catch (error) {
        res.render('admin/pageNotFound')
    }

}

const addProducts = async(req,res)=>{
    try {
        const products = req.body
        const productExist = await Product.findOne({
            productName:products.productName //ivide error adikkan chance ind
        })
        if(!productExist){
            //images handle cheyyan empty array initialise cheyya
            const images = []
            if(req.files && req.files.length>0){
                for(let i=0;i<req.files.length;i++){
                    const originalImagePath = req.files[i].path 
                    const resizedImagePath = path.join('public','uploads','product-images',req.files[i].filename)
                    await sharp(originalImagePath).resize({width:440,height:440}).toFile(resizedImagePath);
                    images.push(req.files[i].filename);
                }
            }
            console.log("The ads products"+req.files)
            const categoryId = await Category.findOne({name:products.category})
            if(!categoryId){
                return res.status(400).join("Invalid category name")
            }
            const newProduct = new Product({
                name:products.productName,
                description:products.description,
                brand:products.brand,
                category:categoryId._id,
                regularPrice:products.regularPrice,
                salePrice:products.salePrice,
                createOn:new Date(),
                quantity:products.quantity,
                size:products.sizeOption,
                color:products.colorOption,
                productImage:images,
                status:"Available"

            })
            await newProduct.save()
            return res.redirect('/admin/addProducts')
        }else{
            return res.status(400).json("product already exist ,please try with another name")
        }
    } catch (error) {
        console.error("Error saving product",error)
        return res.redirect('/admin/pageNotFound')
    }
}

const getProductPage = async(req,res)=>{
    try {
        if(req.session.admin){
            const search = req.query.search||''
            const page = req.query.page || 1
            const limit = 3
            //search nokkanm
            const productData = await Product.find({
                $or:[
                    {productName:{$regex:new RegExp('.*'+search+'.*',"i")}},
                    {brand:{$regex:new RegExp(".*"+search+".*","i")}}
                ],
            }).limit(limit).skip((page-1)*limit).populate("category").exec()

            const count = await Product.find({
                $or:[
                    {productName:{$regex:new RegExp('.*'+search+".*","i")}},
                    {brand:{$regex:new RegExp(".*"+search+".*","i")}},

                ],

            }).countDocuments()
            const totalPages = Math.ceil(count/limit)
            const category = await Category.find({isListed:true})
            const brand = await Brand.find({isBlocked:false})
            //product page kk ella datasum render cheyya
            if(category && brand){
                res.render('admin/products',{
                    data:productData,
                    currentPage:page,
                    totalPages,
                    category,
                    brand
                })
            }
        }else{
            res.redirect('/admin/login')
        }

    } catch (error) {
        
    }
}

const addProductOffer = async(req,res)=>{
    try {
        if(req.session.admin){
            const{percentage,productId} = req.body
            const product = await Product.findOne({_id:productId})
            console.log("The product is"+product)
            const category = await Category.findOne({_id:product.category})
            console.log("the category is "+category)
            if(category.categoryOffer>percentage){
                return res.json({status:false,message:"This products category already exist"})
            }
            if (product.productOffer > 0) {
                return res.json({ status: false, message: "An offer is already applied to this product" });
            }
            const discountAmount = Math.floor(product.regularPrice*(percentage/100))
            product.salePrice = product.regularPrice - discountAmount
            product.productOffer = parseInt(percentage)
             await product.save()
            category.categoryOffer = 0;
            await category.save()
            res.json({status:true,message:"Offer added successsfully"})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.redirect('/pageNotFound')
        res.status(500).json({status:false,message:"Internal Sever error"})
    }
}



const removeProductOffer = async(req,res)=>{
    try {
        if(req.session.admin){
            const{productId} = req.body
            const product = await Product.findOne({_id:productId})
            product.salePrice = product.regularPrice
            product.productOffer = 0
            await product.save()
            res.json({status:true})

        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.redirect("pageNotFound")
    }
}

const blockProduct = async(req,res)=>{
    try {
        const{id} = req.query
        await Product.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect("onsd")
    }

}

const unblockProduct = async(req,res)=>{
    try {
        const{id} = req.query
        await Product.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
        
    }

}

const getEditProduct = async(req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
            const product = await Product.findOne({_id:id})
            //category and brand need to be drop down and user can select to edit them 
            const category = await Category.find({})
            const brand = await Brand.find({})
            res.render('admin/edit-product',{
                product,category,brand
            })
        }else{
            res.render('admin/login')
        }
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const editProduct = async(req,res)=>{
    try {
        const{id} = req.params
        const data = req.body
        const existingProduct = await Product.find({
            productName:data.productName,
            _id:{$ne:id}
        })
       if(existingProduct){
        res.status(400).json({error:"Product with name already exists.please try with another name"})
       }
       const images = []
       if(req.files && req.files.length>0){
        for(let i = 0; i<req.files.length;i++){
            images.push(req.files[i].filename)
        }
       } 
       console.log("the file is"+req.files)
       const updateFields = {
        productName:data.productName,
        description:data.description,
        brand:data.brand,
        category:data.category,
        regularPrice:data.regularPrice,
        salePrice:data.salePrice,
        quantity:data.quantity,
        size:data.size,
        color:data.color
       }
       if(req.files.length>0){
        //push use cheyth image add cheyyu,
        const value = updateFields.$push = {productImage:{$each:images}}
        console.log(value)
        }
        await Product.findByIdAndUpdate(id,updateFields,{new:true})
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error)
        res.redirect('/pageNotFound')
    }
}

const deleteSingleImage = async(req,res)=>{
    const{imageNameToServer,productIdToServer} = req.body
    const product = await Product.findByIdAndUpdate(productIdToServer,{$pull:{productImage:imageNameToServer}})
    const imagePath = path.join('uploads','re-image',imageNameToServer)
    if(fs.existsSync(imagePath)){
        await fs.unlinkSync(imagePath)
        console.log(`image ${imageNameToServer} deleted successfully`)
    }else{
        console.log(`image ${imageNameToServer} not found`);
        
    }
    res.send({status:true})
}
export{
    getProductAddPage,
    addProducts,getProductPage,
    addProductOffer,removeProductOffer,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProduct ,
    deleteSingleImage
}