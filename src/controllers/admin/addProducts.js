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
export{getProductAddPage}