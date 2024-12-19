import{Category}from '../../models/categoriesSchema.js'
import { Product } from '../../models/productSchema.js'

const categoryManagement = async(req,res)=>{
    try {
        if(req.session.admin){
            let page = parseInt(req.query.page||1)
            let limit = 3
            let category = await Category.find({}).sort({createdAt:-1}).limit(limit).skip((page-1)*limit)
            console.log("The find it saved is"+category)
            let categoryCount = await Category.find({}).countDocuments()
            console.log("The cateogry count"+categoryCount)
            let totalpages = Math.ceil(categoryCount/limit)

            res.render('admin/categorymanagement',{categoryData:category,totalpages,currentPage:page})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.render('admin/pageNotFound')
        console.log('The error is '+error)
    }
}

const category = async(req,res)=>{
    try {
        const{name,description} = req.body
        console.log("working 1")
        const existingCategory = await Category.findOne({name})
        if(existingCategory){
            console.log("th")
            return res.status(400).json({error:"Category is already exist"})
        }
        console.log("working 2")
        const newCategory = new Category({name,description})
        console.log("The new cateogry is"+newCategory)
        console.log("working 3")
        const response =  await newCategory.save()
        console.log("The data is saved"+ response)
        console.log("working 4")
        return res.json({message:"Successfully category added"})
        
    } catch (error) {
        console.error(error.message)
        console.log(error)
        return res.status(500).json({error:"uday error"})
    }

}

const addCategoryOffer = async(req,res)=>{
    try {
        if(req.session.admin){
            const percentage = req.body.percentage
            console.log("The percentage is "+percentage)
            const categoryId = req.body.categoryId
            console.log("the category id is "+categoryId)
            const category = await Category.findById(categoryId)
            console.log("The category is "+category)
            if(!category){
                return res.status(500).json({message:"product within the category already have product offer"})
            }
            const products = await Product.find({category:category._id})
            console.log("The product is find"+products)
            const hasOffer = products.some((product)=>product.productOffer>percentage)
            if(hasOffer){
               return res.json({status:false,message:"product already have offer"})
            }
          const newUpdate =  await Category.updateOne({_id:categoryId},{categoryOffer:percentage})
          console.log("Tej new update is"+newUpdate)
            //category l offer undenki product nokkenda aavshym illa
            for(let product of products){
                product.productOffer = 0
                product.salePrice = product.regularPrice
               const saveProduct =  await product.save()
               console.log(saveProduct);
               
            }
            res.json({status:true})
        }
    } catch (error) {
        res.status(500).json({status:false,message:"internal server error"})
        console.log("The server error is "+error)
    }
}

const removeCategoryOffer = async(req,res)=>{

    try {
        if(req.session.admin){
            const categoryId = req.body.categoryId
            const category =await Category.findById(categoryId)
            if(!category){
                return res.status(500).json({message:"category is not found"})
            }
            const percentage = category.categoryOffer
            const products = await Product.find({category:category._id}) 
            if(products.length>0){
                for(const product of products){
                    product.salePrice+=Math.floor(product.regularPrice*(percentage/100))
                    product.productOffer = 0
                    await product.save()
                }
            }
            category.categoryOffer = 0
            await category.save()
            res.json({status:true})
        }
    } catch (error) {
        res.status(500).json({status:false,message:"Internal server error"})
        console.log("The error is "+error)
    }
}
export{categoryManagement,category,addCategoryOffer,removeCategoryOffer}