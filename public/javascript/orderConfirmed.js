document.getElementById('downloadInvoice').addEventListener('click', () => {
    const orderId = document.querySelector('input[name="orderId"]').value;
    if (orderId) {
        window.location.href = `/order/download/pdf/${orderId}`;
    }
});