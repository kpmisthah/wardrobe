
const statusSelects = document.querySelectorAll('.statusSelect'); // Select all statusSelect elements

statusSelects.forEach(statusSelect => {
    statusSelect.addEventListener('change', async(event) => {
        const selectedStatus = event.target.value;
        const orderId = event.target.dataset.orderId;
        console.log("The selected status is: " + selectedStatus);
        try {
            const response = await fetch('/admin/order-status',{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    status:selectedStatus,
                    orderId
                })
            })

        } catch (error) {
            console.log("The error"+error)
        }
    });
});

async function handleReturn(orderId,productId,action){
    try {
        const response = await fetch('/admin/handleReturn',{
            method:"POST",
            headers:{'Content-Type':"application/json"},
            body:JSON.stringify({orderId,productId,action})
        })
        if(response.ok){
            alert("are you going to approve?")

            location.reload(); 

        }
    } catch (error) {
        console.log("The error is"+error)
    }
}

async function cancelOrder(orderId,productId){
    try {
        const response = await fetch('/admin/cancelorder',{
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId,productId
            })
        })
        if(response.ok){
            alert("order deleted successfully")
            
        }
    } catch (error) {
        console.log("error"+error)
    }
}