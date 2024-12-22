import { update } from "tar"
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

const blockBrand = async (req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
            const result1 = await Brand.updateOne({_id:id},{$set:{isBlocked:true}})
            res.redirect('/admin/brand')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.render('admin/pageNotFound')
    }
}

const unblockBrand = async (req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
            console.log("The id is ",id)
            const result = await Brand.updateOne({_id:id},{$set:{isBlocked:false}})
            console.log("The result is "+result);
            
            res.redirect('/admin/brand')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.render('admin/pageNotFound')
    }
}

const deleteBrand = async(req,res)=>{
    try {
        if(req.session.admin){
            const{id} = req.query
            await Brand.deleteOne({_id:id})
            res.redirect('/admin/brand')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        res.redirect('/admin/pageNotfound')
    }
}
export{brandController,addBrand,blockBrand,unblockBrand,deleteBrand}