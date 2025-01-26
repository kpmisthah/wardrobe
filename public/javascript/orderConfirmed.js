document.getElementById('downloadInvoice').addEventListener('click', () => {
 const orderId = document.querySelector('input[name="orderId"]').value;
    window.location.href = `/order/download/pdf/${orderId}`;
});
