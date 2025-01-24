function createSalesGraph(data) {
    const xArray = data.orders.map(order => 
        new Date(order.invoiceDate).toLocaleDateString('en-US') 
    );
    const yArray = data.orders.map(order => 
        order.finalAmount ? order.finalAmount : order.totalPrice 
    );

    const chartData = [{
        x: xArray, 
        y: yArray, 
        type: "bar", 
        marker: { color: "rgba(255, 0, 0, 0.6)" }
    }];

    const layout = {
        title: "Sales Data (Vertical Bar Chart)", 
        xaxis: { title: "Date" }, 
        yaxis: { title: "Amount (₹)" }, 
        margin: { l: 50, r: 20, t: 50, b: 100 } 
    };

    Plotly.newPlot("salesGraph", chartData, layout);
}


document.getElementById('applyFilter').addEventListener('click', async () => {
    const quickFilter = document.getElementById('quickFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const response = await fetch('/admin/dashboard', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickFilter, startDate, endDate })
    });
    
    const data = await response.json();
    console.log(data);
    
    // Update table
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = '';
    data.orders.forEach(order => {
        const row = `<tr>
            <td>${order._id}</td>
            <td>${new Date(order.invoiceDate).toLocaleDateString('en-US')}</td>
            <td>₹${order.totalPrice}</td>
            <td>₹${order.discount}</td>
            <td>₹${order.finalAmount ? order.finalAmount : order.totalPrice}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
        </tr>`;
        ordersTableBody.insertAdjacentHTML('beforeend', row);
    });

    // Update graph
    createSalesGraph(data);

    // Update stats
    document.querySelector('.stat-card:nth-child(1) .value').textContent = data.totalSales;
    document.querySelector('.stat-card:nth-child(2) .value').textContent = data.totalOrders;
    document.querySelector('.stat-card:nth-child(3) .value').textContent = data.totalUsers;
    document.querySelector('.stat-card:nth-child(4) .value').textContent = data.totalProducts;
});

// Initial graph creation when page loads
window.addEventListener('load', async () => {
    const response = await fetch('/admin/dashboard', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            quickFilter: document.getElementById('quickFilter').value
        })
    });
    const data = await response.json();
    createSalesGraph(data);
});
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    window.location.href = '/admin/dashboard/download/pdf';
});

document.getElementById('downloadExcelBtn').addEventListener('click', () => {
    window.location.href = '/admin/dashboard/download/excel';
});