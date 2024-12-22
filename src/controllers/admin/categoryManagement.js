import{Category}from '../../models/categoriesSchema.js'
import { Product } from '../../models/productSchema.js'

const categoryManagement = async(req,res)=>{
    try {
        if(req.session.admin){
            let page = parseInt(req.query.page||1)
            let limit = 3
            let category = await Category.find().sort({createdAt:-1}).limit(limit).skip((page-1)*limit)
            let categoryCount = await Category.find({}).countDocuments()
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
        const existingCategory = await Category.findOne({name})
        if(existingCategory){

            return res.status(400).json({error:"Category is already exist"})
        }
        const newCategory = new Category({name,description})
        const response =  await newCategory.save()
        return res.json({message:"Successfully category added"})
        
    } catch (error) {
        return res.status(500).json({error:"uday error"})
    }

}

const addCategoryOffer = async(req,res)=>{
    try {
        if(req.session.admin){
            const percentage = req.body.percentage
            const categoryId = req.body.categoryId
            const category = await Category.findById(categoryId)
            if(!category){
                return res.status(500).json({message:"product within the category already have product offer"})
            }
            const products = await Product.find({category:category._id})
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
    }
}

const isListed = async(req,res)=>{
    try {
        if(req.session.admin){
            const {id} = req.query
           let value= await Category.findByIdAndUpdate(id,{isListed:true},{new:true})
            res.redirect('/admin/category')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error);
        
    }
}

const unListed = async(req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
           const result =  await Category.findByIdAndUpdate(id,{isListed:false},{new:true})
            res.redirect('/admin/category')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/admin/category');
        
    }
}

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
export{categoryManagement,category,addCategoryOffer,removeCategoryOffer,isListed,unListed,edit,editCategory}