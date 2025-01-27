// import { Review } from "../../models/reviewSchema.js";

// const handleReviewSubmission = async(req,res)=>{
//     try {
//       const{rating,review,productId} = req.body
//       const userId = req.session.user
//     if(review.length<10){
//       return res.status(400).json({message:'review must be greateer than 10'})
//     }
//     const existingReview = await Review.findOne({ userId, productId });
//     if (existingReview) {
//         return res.status(400).json({status: 'error',message: 'You have already reviewed this product'});
//     }
//       const newReview= new Review({
//         rating,
//         review,
//         productId,
//         userId
//       })
//       console.log("the review is"+newReview);
      
//       await newReview.save()
//       res.json({status:200,message:"review addedd successfully"})

//     } catch (error) {
//         console.log("The error is "+error)
//     }
// }
// export{handleReviewSubmission}