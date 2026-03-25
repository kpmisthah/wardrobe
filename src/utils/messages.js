export const Messages = {
    // General
    SERVER_ERROR: "Internal Server Error",
    FIELDS_REQUIRED: "All Fields are required",
    SOMETHING_WENT_WRONG: "Something went wrong",
    DATA_UPDATED: "Data updated successfully",
    FAILED_LOAD_PRODUCTS: "Failed to load products",

    // Auth
    PASSWORD_MISMATCH: "Passwords do not match",
    USER_EXISTS: "User with this email already exists",
    OTP_SENT: "OTP sent successfully!",
    USER_NOT_FOUND: "User not found",
    ACCOUNT_BLOCKED: "Your account has been blocked by admin",
    INCORRECT_PASSWORD: "Incorrect password",
    LOGIN_SUCCESS: "Login successful",
    LOGIN_ERROR: "An error occurred during login",
    OTP_CREATED: "Otp is created",
    OTP_EXPIRED: "OTP has expired or is invalid.",
    OTP_INVALID: "Invalid OTP.",
    OTP_VERIFIED: "OTP verified successfully.",
    PASSWORD_CHANGED: "Password changed successfully",
    INVALID_CREDENTIALS: "Invalid credentials",
    SESSION_EXPIRED: "Session expired. Please try again.",
    PASSWORD_UPDATED: "Password updated successfully",

    // Admin - Customer
    USER_BLOCKED: "User blocked successfully",
    USER_UNBLOCKED: "User unblocked successfully",

    // Category
    CATEGORY_EXISTS: "Category is already exist",
    CATEGORY_ADDED: "Successfully category added",
    CATEGORY_NOT_FOUND: "Category not found",
    CATEGORY_EDIT_EXISTS: "Category exist pls choose another name",

    // Subcategory
    SUBCATEGORY_EXISTS: "Subcategory is already exist",
    SUBCATEGORY_ADDED: "Successfully subcategory added",
    SUBCATEGORY_NOT_FOUND: "Subcategory not found",
    SUBCATEGORY_EDIT_EXISTS: "Subcategory exist pls choose another name",

    // Product
    INVALID_CATEGORY: "Invalid category name",
    PRODUCT_EXISTS: "Product already exist, please try with another name",
    PRODUCT_EDIT_EXISTS: "Product with this name already exists. please try with another name",
    PRODUCT_NOT_FOUND: "Product not found",
    PRODUCT_UNAVAILABLE: "This product is currently unavailable",
    SIZE_NOT_FOUND: "Size not found for this product",
    QUANTITY_UPDATED: "Quantity is update successfully",
    SIZE_ADDED: "Size added successfully",
    NOT_ENOUGH_STOCK: "Not enough stock",
    MAX_QTY_EXCEEDED: "Cannot add more than 10 units per person.",
    INSUFFICIENT_STOCK: "Insufficient stock",

    // Coupon
    COUPON_EXISTS: "Coupon already exists",
    COUPON_ADDED: "Coupon added successfully",
    COUPON_NOT_FOUND: "Coupon not found",
    COUPON_UPDATED: "Coupon updated successfully",
    COUPON_DELETED: "Coupon deleted successfully",
    INVALID_COUPON: "Invalid or expired coupon",
    COUPON_ALREADY_USED: "You have already used this coupon",
    COUPON_APPLIED: "Coupon applied successfully",
    COUPON_REMOVED: "Coupon removed successfully, price reverted to original",
    FAILED_APPLY_COUPON: "Failed to apply coupon",

    // Offer
    OFFER_INVALID_PERCENTAGE: "Percentage must be between 0 and 100",
    OFFER_REMOVED: "Offer removed successfully",

    // Order
    ORDER_NOT_FOUND: "Order not found",
    ORDER_UPDATED: "Order is updated successfully",
    ITEM_NOT_FOUND: "Item not found",
    ITEM_CANCELED: "Item canceled successfully",
    ITEM_ALREADY_CANCELED: "Item already canceled",
    ORDER_CANCELED: "Order canceled successfully",
    CANNOT_SHIP_UNPAID: "Cannot ship or deliver an order that has not been paid for.",
    CANNOT_REFUND_UNPAID: "Cannot refund an order that was not successfully paid.",
    INVALID_ACTION: "Invalid action provided",
    RETURN_ALREADY_REQUESTED: "Return already requested for this product",
    RETURN_SUBMITTED: "Return request submitted successfully",
    ORDER_STATUS_UPDATED: "Order status updated successfully",
    FAILED_UPDATE_STATUS: "Failed to update order status",
    UNAUTHORIZED_ACTION: "Unauthorized action",
    ORDER_PLACED: "Order placed successfully",
    PENDING_ORDER_CREATED: "Pending order created",
    FAILED_PENDING_ORDER: "Failed to create pending order",
    ORDER_SAVED: "Order saved successfully",
    FAILED_SAVE_ORDER: "Failed to save order",
    FAILED_RETRY_PAYMENT: "Failed to create retry payment",
    INVALID_RETRY_ORDER: "Invalid order for retry payment.",
    PAYMENT_COMPLETED: "Payment completed successfully",
    FAILED_COMPLETE_PAYMENT: "Failed to complete payment",

    // Cart
    CART_NOT_FOUND: "Cart not found",
    CART_EMPTY: "Cart is empty",
    ITEM_NOT_IN_CART: "Item not found in cart",
    ITEM_ADDED_CART: "Item added to the cart successfully",
    ITEM_QTY_INCREMENTED: "Item quantity incremented",
    ITEM_QTY_DECREMENTED: "Item quantity decremented",
    QTY_MIN_REACHED: "Quantity cannot be less than 1",
    CART_COUNT_ERROR: "Error fetching cart count",
    FAILED_REMOVE_ITEM: "Failed to remove item",

    // Address
    ADDRESS_ADDED: "Address added successfully",
    ADDRESS_NOT_FOUND: "Address not found",
    ADDRESS_DELETED: "Address deleted successfully",

    // Wishlist
    WISHLIST_ONLY_ONE: "Only one quantity of a product can be added to the wishlist",
    WISHLIST_PRODUCT_EXISTS: "Product is already exist",
    WISHLIST_ADDED: "Product added to wishlist",
    WISHLIST_NOT_FOUND: "Wishlist not found",
    WISHLIST_DELETED: "Wishlist deleted successfully",
    PRODUCT_OUT_OF_STOCK: "Product is out of stock",
    PRODUCT_ALREADY_IN_CART: "Product is already in cart",
    PRODUCT_ADDED_CART: "Product is added to cart successfully",

    // Wallet
    BALANCE_INSUFFICIENT: "Balance is insufficient",
    WALLET_ORDER_PLACED: "Order placed successfully",

    // Payment
    PAYMENT_PROCESSING_ERROR: "An error occurred while processing the order or subscription.",

    // Invoice
    INVOICE_ERROR: "Error generating invoice",
    ORDER_NOT_FOUND_AUTH: "Order not found or unauthorized",

    // COD
    COD_LIMIT: "Cash on Delivery is not allowed for orders above Rs 1000.",
    MIN_PURCHASE_REQUIRED: "Minimum purchase amount required",
    COUPON_NOT_VALID_TIME: "Coupon is not valid at this time",
    OTP_REDIRECT: "redirect to verifiy otp",
    INVALID_REQUEST: "Invalid request data. OTP or email missing.",
    SESSION_EXPIRED_SIGNUP: "Session expired. Please signup again.",
    VERIFICATION_ERROR: "An error occurred during verification",
    GENERAL_ERROR: "An error occurred",
    NO_ACCOUNT_FOUND: "No account found with this email",
    SIZE_NOT_FOUND_PARAM: "Size not found for this product.",
    INSUFFICIENT_STOCK_PARAM: "Insufficient stock for this product.",
    PRODUCT_UNAVAILABLE_REMOVE: "Product is currently unavailable. Please remove it from your cart.",
    INCORRECT_PASSWORD: "Incorrect old password",
    OTP_EXPIRED: "OTP has expired or is invalid.",
    INVALID_OTP: "Invalid OTP.",
    SESSION_EXPIRED: "Session expired. Please try again.",
};
