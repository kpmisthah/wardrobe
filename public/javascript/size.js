  
const form = document.getElementById('size-product')
form.addEventListener('submit',async(event)=>{
    event.preventDefault()

const product = document.getElementById('product').value
const size =  document.getElementById('size').value 
const quantity = document.getElementById('quantity').value
    try{
    const response = await fetch('/admin/add-size',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({product,size,quantity})
})

if(response.ok){
    alert("size is added")
    location.href = '/admin/size'
}
} catch (error) {
console.log("The error is "+error)
}
})
