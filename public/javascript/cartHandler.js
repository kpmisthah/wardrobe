const CartHandler = {
    init: function() {
        this.cartNotification = document.querySelector('.js-show-cart');
        this.bindEvents();
        this.fetchCartCount();  // Fetch cart count on page load
    },

    bindEvents: function() {
        document.addEventListener('cartUpdated', this.updateCartCount.bind(this));
    },

    updateCartCount: function(event) {
        const count = event.detail.count;
        if (this.cartNotification) {
            this.cartNotification.setAttribute('data-notify', count);
        }
    },

    dispatchCartUpdate: function(count) {
        const event = new CustomEvent('cartUpdated', {
            detail: { count }
        });
        document.dispatchEvent(event);
    },

    fetchCartCount: function() {
        fetch('/cart/count')
            .then(res => res.json())
            .then(data => {
                console.log("Cart Count:", data);
                this.dispatchCartUpdate(data.count); // Update UI with count
            })
            .catch(err => console.error("Error fetching cart count:", err));
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CartHandler.init();
});
