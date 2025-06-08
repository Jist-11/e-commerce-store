// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.querySelector('.cart-count');
const productContainer = document.getElementById('product-container');
const searchBtn = document.getElementById('search-btn');
const closeSearch = document.getElementById('close-search');
const searchBox = document.getElementById('search-box');
const quickViewModal = document.getElementById('quick-view-modal');
const closeModal = document.getElementById('close-modal');
const modalProductDetails = document.getElementById('modal-product-details');

// Cart array to store items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Toggle Cart Sidebar
cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartSidebar.classList.add('active');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
});

// Toggle Search Box
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchBox.classList.add('active');
});

closeSearch.addEventListener('click', () => {
    searchBox.classList.remove('active');
});

// Display Products
function displayProducts(products) {
    productContainer.innerHTML = products.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="product-badge ${product.badge.type}">${product.badge.text}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rating))}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="quick-view" data-id="${product.id}">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            addToCart(product);
        });
    });

    document.querySelectorAll('.quick-view').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            showQuickView(product);
        });
    });
}

// Add to Cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} added to cart!`);
}

// Update Cart
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Render Cart Items
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="decrement">-</button>
                    <span>${item.quantity}</span>
                    <button class="increment">+</button>
                </div>
                <div class="cart-item-remove">
                    <i class="fas fa-trash"></i> Remove
                </div>
            </div>
        </div>
    `).join('');

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Add event listeners to quantity buttons
    document.querySelectorAll('.increment').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            item.quantity += 1;
            updateCart();
        });
    });

    document.querySelectorAll('.decrement').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item.id !== productId);
            }
            
            updateCart();
        });
    });

    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.cart-item').getAttribute('data-id'));
            cart = cart.filter(item => item.id !== productId);
            updateCart();
        });
    });
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

// Show Quick View Modal
function showQuickView(product) {
    modalProductDetails.innerHTML = `
        <div class="modal-product-img-container">
            <img src="${product.image}" alt="${product.name}" class="modal-product-img">
        </div>
        <div class="modal-product-info">
            <h2>${product.name}</h2>
            <div class="modal-product-price">$${product.price.toFixed(2)}</div>
            <div class="modal-product-rating">
                <div class="stars">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rating))}
                </div>
                <div class="reviews">${product.reviews} reviews</div>
            </div>
            <p class="modal-product-description">${product.description}</p>
            <div class="modal-product-actions">
                <button class="btn add-to-cart-modal" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn wishlist-btn">
                    <i class="fas fa-heart"></i> Wishlist
                </button>
            </div>
            <div class="modal-product-quantity">
                <button class="decrement">-</button>
                <input type="number" value="1" min="1">
                <button class="increment">+</button>
            </div>
            <div class="modal-product-meta">
                <p><span>Category:</span> ${product.category}</p>
                <p><span>Availability:</span> ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                <p><span>SKU:</span> ${product.sku}</p>
            </div>
        </div>
    `;

    // Add event listener to modal add to cart button
    document.querySelector('.add-to-cart-modal').addEventListener('click', () => {
        const quantity = parseInt(document.querySelector('.modal-product-quantity input').value);
        const productToAdd = {
            ...product,
            quantity: quantity
        };
        
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push(productToAdd);
        }
        
        updateCart();
        showNotification(`${product.name} added to cart!`);
        quickViewModal.classList.remove('active');
    });

    // Add event listeners to quantity buttons in modal
    document.querySelector('.modal-product-quantity .increment').addEventListener('click', () => {
        const input = document.querySelector('.modal-product-quantity input');
        input.value = parseInt(input.value) + 1;
    });

    document.querySelector('.modal-product-quantity .decrement').addEventListener('click', () => {
        const input = document.querySelector('.modal-product-quantity input');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });

    quickViewModal.classList.add('active');
}

// Close Quick View Modal
closeModal.addEventListener('click', () => {
    quickViewModal.classList.remove('active');
});

// Close modal when clicking outside
quickViewModal.addEventListener('click', (e) => {
    if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
    }
});

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the page
function init() {
    displayProducts(products);
    renderCartItems();
    updateCartCount();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);