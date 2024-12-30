import { Category } from "../../models/categoriesSchema.js"
import { Subcategory } from "../../models/subcategorySchema.js"
const subcategoryManagement = async(req,res)=>{
    try {
        let subcategory = await Subcategory.find()
        return res.render('admin/subcategory',{subcategory})
    } catch (error) {
        return res.render('admin/pageNotFound')
    }
    
  }

  const subcategory = async(req,res)=>{
    try {
        console.log('hello')
        console.log('Request body:', req.body); // Log the request body
        const{name,description} = req.body
        const existingSub = await Subcategory.findOne({name})
        if(existingSub){
            return res.status(400).json({error:"subcategory is already exist"})
        }
   
        const newSub = new Subcategory({name,description})
        await newSub.save()
        return res.status(200).json({message:"successfully subcategory addedd"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "internal server error" });
       
    }
  }

  const isList = async(req,res)=>{
    try {
        const {id} = req.query
         await Subcategory.findByIdAndUpdate(id,{isListed:true},{new:true})
        res.redirect('/admin/subcategory')

    } catch (error) {
        console.log(error)
    }
  }
  const unList = async(req,res)=>{
    try {
        const {id} = req.query
         await Subcategory.findByIdAndUpdate(id,{isListed:false},{new:true})
        res.redirect('/admin/subcategory')

    } catch (error) {
        console.log(error)
    }
  }
  const subedit = async(req,res)=>{
    try {
        const{id} = req.query
        const subcategory = await Subcategory.findById(id)
        if (!subcategory) {
            return res.status(404).send("Subcategory not found")
        }
        res.render('admin/edit-subcategory',{subcategory})
    } catch (error) {
        console.log("The error is "+error)
    }
  }

  const editSubcategory = async(req,res)=>{
    try {
        const{id} = req.params
        const{categoryName,description} = req.body
        const existingCategory = await Subcategory.findOne({name:categoryName})
        if(existingCategory){
        return res.status(400).json({error:"Subcategory exist pls choose another name"})
        }
        const updatesubCategory = await Subcategory.findByIdAndUpdate(id,{
        name:categoryName,
        description
        },{new:true})
        if(updatesubCategory){
        res.redirect('/admin/subcategory')
        }else{
        res.status(404).json({error:"Category not found"})
        }
    } catch (error) {
        res.status(500).json({error:"Internal server error"})
    }
  }
  export {subcategoryManagement,subcategory,isList,unList,subedit,editSubcategory}

