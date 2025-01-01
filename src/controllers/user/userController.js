import {User} from "../../models/userSchema.js"
import { Product } from "../../models/productSchema.js"
import { Category } from "../../models/categoriesSchema.js"
import { Address } from "../../models/addressSchema.js"
// import { sendEmail } from "../../utils/sendEmail.js";

//load Home page
const loadHome = async(req,res)=>{
    try {
    //separate category
         const menCategory = await Category.findOne({name:"Men"})
         console.log("The product is "+menCategory)
         const womenCategory = await Category.findOne({name:"Women"})
         const kidsCategory = await Category.findOne({name:"Kids"})

         const menProducts = await Product.find({ category: menCategory._id ,isBlocked:false}).limit(1);
         console.log("The products rendered is", menProducts);
         const womenProducts = await Product.find({category:womenCategory._id,isBlocked:false}).limit(1)
         const kidsProducts = await Product.find({category:kidsCategory._id,isBlocked:false}).limit(1)

         //product overview

         const product = await Product.find({isBlocked:false}).sort({createdAt:-1}).limit(4)
         let user = req.session.user
         console.log("The session is "+user)
         if(user){
            let userData = await User.findOne({_id:user})
            return res.render('user/home',{user:userData,menProducts,womenProducts,kidsProducts,product})
         }
        return res.render('user/home',{menProducts,womenProducts,kidsProducts,product})

    } catch (error) {
       console.log(error);
        return res.status(500).send("server error")
    }
}

//load Error page
const loadError = async(req,res)=>{
    try {
       return res.render('user/pageNotFound')
    } catch (error) {
        console.log(error)
       return res.status(500).send("Server error")
    }
}

const loadShoppingPage =  async(req,res)=>{
  
    try {
            let page = parseInt(req.query.page ||1);
            const sortOption = req.query.sort||null
            let limit = 4
            let filter = {isBlocked:false}

            //sort method
            let sort = {}
            //The empty object gets replaced with specific sort criteria when needed
            //If no sort option matches, it remains empty, meaning no specific sorting
            if(sortOption == 'priceLowtoHigh'){
             sort = {salePrice:1}
            }else if(sortOption === 'priceHightoLow'){
             sort = {salePrice:-1}
            }else if(sortOption === 'below-1500'){
                filter.salePrice = {$lte:1500}
            }else if(sortOption === '2000-2500' ){
                filter.salePrice = {$gte:2000,$lte:2500}
            }else if(sortOption === '2500-3000'){
                filter.salePrice = {$gte:2500,$lte:3000}
            }else if(sortOption === '3000-4000'){
                filter.salePrice = {$gte:3000,$lte:4000}
            }else if(sortOption === 'Above4000'){
                filter.salePrice = {$gte:4000}
            }else if(sortOption === '1500-2000'){
                filter.salePrice = {$gte:1500,$lte:2000} //==product.find({isBlocked:false,salePrice:{$gte:1500,$lte:2000}})
            }else if(sortOption === 'new'){
                sort = {createdAt:-1}
            }else if(sortOption == 'Available'){
                filter.isStock = true
            }else if(sortOption == 'Unavailable'){
                filter.isStock = false
            }
            

            let products =await Product.find(filter).sort(sort).skip((page-1)*limit).limit(limit)
            const count =await Product.countDocuments(filter)
            const totalpage = Math.ceil(count/limit)

            for(let product of products) {
                const isStock = product.sizeOptions.some(option => option.quantity > 0);
                if(isStock !== product.isStock) {
                    product.isStock = isStock;
                    await product.save();
                }
            }
    // Calculate stock statuses using separate queries
;
            let user = req.session.user
            console.log("The user is "+user)
                let userData = await User.findOne({_id:user})
               return res.render('user/shop',{user:userData,products,totalpage,page})

            } catch (error) {
        console.log(error)
    }

}

//load user Profile page
const loadProfile = async(req,res)=>{
    try {
        const users =req.session.user
        const userProfile = await User.findOne({_id:users})
        console.log("The users is "+userProfile)
        return res.render('user/myaccount',{userProfile})
    } catch (error) {
        
    }
}

//load users addAdress page

const addAddress = async(req,res)=>{
    try {
        return res.render('user/addAddress')
    } catch (error) {
        
    }
}

//post the address into address page
//user id session eduth store cheyth
const address = async(req,res)=>{
    try {
        const user = req.session.user
        const formData = req.body
        const userAddress = await Address.findOne({userId:user})
        if(userAddress){
            userAddress.address.push({
                name:formData.name,
                email:formData.email,
                phone:formData.phone,
                city:formData.city,
                zipCode:formData.zipCode,
                state:formData.state,
                houseNumber:formData.houseNumber,
                district:formData.district,
            })
            await userAddress.save()
            return res.status(200).json({message:"Address is addedd successfully"})
        }else{
            const newAddress =new Address({
                userId:user,
                address:[{
                name:formData.name,
                email:formData.email,
                phone:formData.phone,
                city:formData.city,
                zipCode:formData.zipCode,
                state:formData.state,
                houseNumber:formData.houseNumber,
                district:formData.district,
               
            }]
            })
            await newAddress.save()
            return res.status(200).json({message:"Address added successfully"})
        }

    } catch (error) {
        console.error('Error saving address:', error);
        return res.status(500).json({ error: 'Internal server error' });

    }
}

const getAddress = async(req,res)=>{
    try {
        const userId = req.session.user
        const existingAddress = await Address.findOne({userId})
        if(!existingAddress){
            res.render('user/getAddress',{address:[]})
        }
        console.log("The address is "+existingAddress)
        return res.render('user/getAddress',{address:existingAddress.address})
    } catch (error) {
        console.log("The error is"+error)
    }
}

const getEditPage = async(req,res)=>{
    try {
        const{id} = req.params
        const userId = req.session.user
        const addressId = id
        const userAddress= await Address.findOne({userId})
        if(!userAddress){
            return res.redirect('/getAddress')
        }
        const address = userAddress.address.find(addr=>addr._id.toString()===addressId)
        if(!address){
            return res.redirect('/getAddress')
        }
        return res.render('user/edit-address',{address})
    } catch (error) {
        console.log("Error in get eidt page",error)
    }
}

const edit = async(req,res)=>{
    try {
        const user = req.session.user
        console.log("The update user"+user)
        const {id} = req.params
        console.log("teh params"+id)
        const data = req.body
      await Address.updateOne({userId:user,'address._id':id},{
        $set:{
            'address.$.name':data.name,
            'address.$.email':data.email,
            'address.$.phone':data.phone,
            'address.$.city':data.city,
            'address.$.zipCode':data.zipCode,
            'address.$.houseNumber':data.houseNumber,
            'address.$.district':data.district,
            'address.$.state':data.state,
        }
     })
        res.status(200).json({message:"data updated successfully"})
    } catch (error) {
        console.log("somethig went wrong",error)
    }
}

const deleteAddress = async(req,res)=>{
    try {
        const user = req.session.user
        const{id} = req.params
        const address = await Address.findOneAndUpdate({userId:user},{$pull:{address:{_id:id}}},{new:true})
        if(!address){
            return res.status(404).json({message:"Address not found"})
        }
        return res.status(200).json({message:"address deleted successfully"})
    } catch (error) {
        console.log("The error is"+error)
        res.status(500).json({'message':'Internal server error'})
    }
}
//load Orders page
const orders = async(req,res)=>{
    try {
        return res.render('user/orders')
    } catch (error) {
        console.log("The error is"+error)
    }
}

const updateProfile = async(req,res)=>{
    try {

        return res.render('user/updateProfile')
    } catch (error) {
        console.log("The error is"+error)
    }
}


export {
    loadHome,
    loadError,
    loadShoppingPage,
    loadProfile,
    orders,
    updateProfile,
    getAddress,
    addAddress,
    address,
    getEditPage,
    edit,
    deleteAddress,
}
