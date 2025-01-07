async function addToWishlist(productId){
    try {
        const response = await fetch('/add-to-wishlist',{
            method:"POST",
            header:{'Content-Type':"application/json"},
            body:JSON.stringify({productId})
        })
    } catch (error) {
        
    }
}