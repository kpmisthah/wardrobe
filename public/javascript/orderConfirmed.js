document.getElementById('downloadInvoice').addEventListener('click', () => {
 const orderId = document.querySelector('input[name="orderId"]').value;
 console.log("The id is"+orderId)
    window.location.href = `/order/download/pdf/${orderId}`;
});
