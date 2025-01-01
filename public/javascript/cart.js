
async function addToCart(productId,name,price,stock,size) {
    if(!size || size == 'Choose an option'){
        alert('please select a size')
        return
    }

    const cartItems = {productId,name,price,stock,size}
    try {
        const response =await fetch('/add-to-cart',{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(cartItems)
        })
        const responseData = await response.json()
        if(response.ok){
            alert("Item is added to cart successfully")
        }else if (responseData.message == 'Not enough stock for size'){
            alert(`not enough stock left only ${responseData.stockLeft}`)
        }else{
            alert("failed to add item to cart")
        }
    } catch (error) {
        console.log("error on adding item to cart"+error)
    }
}