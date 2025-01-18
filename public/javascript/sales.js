function createSalesGraph(data) {
    const dates = data.orders.map(order => new Date(order.invoiceDate).toLocaleDateString('en-US'));
    const amounts = data.orders.map(order => 
        order.finalAmount ? order.finalAmount : order.totalPrice
    );

    const trace = {
        x: dates,
        y: amounts,
        type: 'scatter',
        mode: 'lines+markers',
        line: {
            color: '#2196F3',
            width: 2
        },
        marker: {
            size: 6,
            color: '#2196F3'
        }
    };

    const layout = {
        title: 'Sales Trend',
        xaxis: {
            title: 'Date',
            tickangle: -45
        },
        yaxis: {
            title: 'Amount (₹)',
            tickprefix: '₹'
        },
        margin: {
            l: 60,
            r: 40,
            b: 80,
            t: 40
        },
        height: 400
    };

    Plotly.newPlot('salesGraph', [trace], layout);
}

// Modify your existing event listener to update the graph
document.getElementById('applyFilter').addEventListener('click', async () => {
    const quickFilter = document.getElementById('quickFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const response = await fetch('/admin/sales', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickFilter, startDate, endDate })
    });
    
    const data = await response.json();
    
    // Update table
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
    const response = await fetch('/admin/sales', {
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