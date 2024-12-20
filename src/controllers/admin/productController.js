import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { Brand } from "../../models/brandSchema.js"
import fs from "fs"
import path from "path"
import sharp from "sharp"

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
    const{percentage,productId} = req.body
    const product = await Product.findById(productId)
    if(!product){
        res.status(500).json({message:""})
    }
}

const removeProductOffer = async(req,res)=>{

}
export{getProductAddPage,addProducts,getProductPage,addProductOffer,removeProductOffer}