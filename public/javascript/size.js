
const form = document.getElementById('size-product')
form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const product = document.getElementById('product').value
    const size = document.getElementById('size').value
    const quantity = document.getElementById('quantity').value
    try {
        const response = await fetch('/admin/add-size', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product, size, quantity })
        })

        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Size has been added successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // location.href = '/admin/size';
                document.getElementById('size-product').reset(); // Clear the form
            });
        }
    } catch (error) {
        console.log("The error is " + error)
    }
})
