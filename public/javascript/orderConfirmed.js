document.getElementById('downloadInvoice').addEventListener('click', () => {
 const orderId = document.querySelector('input[name="orderId"]').value;
    window.location.href = ` https://wardrobe.zapto.org/order/download/pdf/${orderId}`;
});
