document.getElementById('applyFilter').addEventListener('click',async()=>{
    const quickFilter = document.getElementById('quickFilter').value
    const startDate = document.getElementById('startDate').value
    const endDate = document.getElementById('endDate').value

    const response = await fetch('/admin/dashboard',{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({quickFilter,startDate,endDate})
    })
    const data = await response.json();
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = '';
    data.orders.forEach(order => {
        const row = `<tr>
            <td>${order._id}</td>
            <td>${new Date(order.invoiceDate).toLocaleDateString('en-US')}</td>
            <td>₹${order.totalPrice}</td>
            <td>₹${order.discount}</td>
            <td>${order.coupon || '-'}</td>
            <td>₹${order.finalAmount ? order.finalAmount : order.totalPrice}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
        </tr>`;
        ordersTableBody.insertAdjacentHTML('beforeend', row);
    });
})