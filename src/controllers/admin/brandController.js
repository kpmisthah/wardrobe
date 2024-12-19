import { Brand } from "../../models/brandSchema.js"
import { Product } from "../../models/productSchema.js"

const brandController = async(req,res)=>{
    try {
        if(req.session.admin){
            let page = req.query.page||1
            let limit = 3
            const brandData = await Brand.find({}).sort({createdAt:-1}).skip((page-1)*limit).limit(limit)
            const totalBrand = await Brand.countDocuments()
            const totalPages =Math.ceil(totalBrand/limit)
            const reverseBrand = brandData.reverse()
            res.render('admin/brands',{totalPages,page,reverseBrand,totalBrand,brandData})
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.render('admin/pageNotFound')
    }
}

const addBrand = async(req,res)=>{
    try {
        if(req.session.admin){
            const brand = req.body.name
            const findBrand = await Brand.findOne({brand})
            if(!findBrand){
                const image = req.file.filename
                const newBrand = new Brand({
                    brandName:brand,
                    brandImage:image
                })
                await newBrand.save()
                res.redirect('/admin/brand')
            }
        }
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

export{brandController,addBrand}