const API_URL = 'http://localhost:3000/api';

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const productsTableBody = document.getElementById('productsTableBody');
const addProductForm = document.getElementById('addProductForm');
const searchInput = document.getElementById('searchInput');
const editModal = document.getElementById('editModal');
const stockModal = document.getElementById('stockModal');
const editProductForm = document.getElementById('editProductForm');
const stockUpdateForm = document.getElementById('stockUpdateForm');

let allProducts = [];

// Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        switchView(viewName);
    });
});

function switchView(viewName) {
    navBtns.forEach(btn => btn.classList.remove('active'));
    views.forEach(view => view.classList.remove('active'));
    
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    document.getElementById(`${viewName}${viewName === 'alerts' ? 'View' : viewName === 'categories' ? 'View' : viewName === 'add' ? 'ProductView' : 'ProductsView'}`).classList.add('active');
    
    if (viewName === 'all') loadProducts();
    if (viewName === 'alerts') loadLowStockAlerts();
    if (viewName === 'categories') loadCategoryFilter();
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/statistics`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('totalProducts').textContent = result.data.totalProducts;
            document.getElementById('totalItems').textContent = result.data.totalItems;
            document.getElementById('totalValue').textContent = `₹${result.data.totalValue}`;
            document.getElementById('lowStockCount').textContent = result.data.lowStockCount;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
            allProducts = result.data;
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Display products
function displayProducts(products) {
    if (products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="9" class="no-data">No products found</td></tr>';
        return;
    }
    
    productsTableBody.innerHTML = products.map(product => {
        const status = product.quantity === 0 ? 'critical' : 
                      product.quantity <= product.reorderLevel ? 'low' : 'ok';
        const statusText = product.quantity === 0 ? 'Out of Stock' :
                          product.quantity <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.reorderLevel}</td>
                <td>${product.leadTime} days</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
                <td class="action-btns">
                    <button class="btn btn-edit" onclick="openEditModal(${product.id})">✏️</button>
                    <button class="btn btn-stock" onclick="openStockModal(${product.id})">📦</button>
                    <button class="btn btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
});

// Load categories
// Load categories (ensures specific options are present)
async function loadCategories() {
    // desired default categories
    const DEFAULT_CATS = ["Electronics", "Clothing", "Food", "Furniture", "Books", "Other"];

    try {
        const response = await fetch(`${API_URL}/categories`);
        const result = await response.json();

        // Decide which list to use: API result (if valid) or default list
        let categories = Array.isArray(result && result.data) && result.data.length > 0
            ? result.data
            : DEFAULT_CATS;

        // Normalize: ensure the default set is always present (no duplicates)
        const normalized = Array.from(new Set([...categories.map(c => capitalize(c)), ...DEFAULT_CATS]));

        const categorySelects = [
            document.getElementById('productCategory'),
            document.getElementById('editProductCategory'),
            document.getElementById('categoryFilter')
        ].filter(Boolean); // remove any nulls if select not present

        categorySelects.forEach(select => {
            const previous = select.value || "";
            // add a placeholder option
            let html = `<option value="" disabled selected>Select a category</option>\n`;
            html += normalized.map(cat => `<option value="${cat}">${cat}</option>`).join("\n");
            select.innerHTML = html;

            // restore previous selection if still available
            if (previous) {
                // try exact match first, otherwise try capitalized match
                if ([...select.options].some(opt => opt.value === previous)) {
                    select.value = previous;
                } else if ([...select.options].some(opt => opt.value === capitalize(previous))) {
                    select.value = capitalize(previous);
                }
            }
            // mark select required (optional; remove if you don't want this)
            select.required = true;
        });

    } catch (error) {
        console.error('Error loading categories:', error);
        // On error, populate with defaults so user can still add products
        const categorySelects = [
            document.getElementById('productCategory'),
            document.getElementById('editProductCategory'),
            document.getElementById('categoryFilter')
        ].filter(Boolean);

        categorySelects.forEach(select => {
            let html = `<option value="" disabled selected>Select a category</option>\n`;
            html += DEFAULT_CATS.map(cat => `<option value="${cat}">${cat}</option>`).join("\n");
            select.innerHTML = html;
            select.required = true;
        });
    }

    // helper
    function capitalize(s) {
        if (!s || typeof s !== 'string') return s;
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }
}


// Add product
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        price: parseFloat(document.getElementById('productPrice').value),
        reorderLevel: parseInt(document.getElementById('productReorder').value),
        leadTime: parseInt(document.getElementById('productLead').value),
        category: document.getElementById('productCategory').value
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product added successfully!', 'success');
            addProductForm.reset();
            loadStatistics();
            switchView('all');
        } else {
            showNotification(result.message || 'Error adding product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product', 'error');
    }
});

// Open edit modal
async function openEditModal(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const result = await response.json();
        
        if (result.success) {
            const product = result.data;
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductQuantity').value = product.quantity;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductReorder').value = product.reorderLevel;
            document.getElementById('editProductLead').value = product.leadTime;
            document.getElementById('editProductCategory').value = product.category;
            
            editModal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

// Edit product
editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const productData = {
        name: document.getElementById('editProductName').value,
        quantity: parseInt(document.getElementById('editProductQuantity').value),
        price: parseFloat(document.getElementById('editProductPrice').value),
        reorderLevel: parseInt(document.getElementById('editProductReorder').value),
        leadTime: parseInt(document.getElementById('editProductLead').value),
        category: document.getElementById('editProductCategory').value
    };
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product updated successfully!', 'success');
            editModal.style.display = 'none';
            loadProducts();
            loadStatistics();
        } else {
            showNotification(result.message || 'Error updating product', 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product', 'error');
    }
});

// Open stock modal
async function openStockModal(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const result = await response.json();
        
        if (result.success) {
            const product = result.data;
            document.getElementById('stockProductId').value = product.id;
            document.getElementById('stockProductName').textContent = product.name;
            document.getElementById('stockProductQuantity').textContent = product.quantity;
            document.getElementById('stockAmount').value = '';
            
            stockModal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

// Update stock
stockUpdateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('stockProductId').value;
    const operation = document.querySelector('input[name="stockOperation"]:checked').value;
    const amount = parseInt(document.getElementById('stockAmount').value);
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation, amount })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            stockModal.style.display = 'none';
            loadProducts();
            loadStatistics();
        } else {
            showNotification(result.message || 'Error updating stock', 'error');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification('Error updating stock', 'error');
    }
});

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully!', 'success');
            loadProducts();
            loadStatistics();
        } else {
            showNotification(result.message || 'Error deleting product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

// Load low stock alerts
async function loadLowStockAlerts() {
    try {
        const response = await fetch(`${API_URL}/products/alerts/low-stock`);
        const result = await response.json();
        
        const alertsContainer = document.getElementById('alertsContainer');
        
        if (result.success && result.data.length > 0) {
            alertsContainer.innerHTML = result.data.map(product => `
                <div class="alert-card">
                    <h3>⚠️ ${product.name}</h3>
                    <p><strong>Current Stock:</strong> ${product.quantity}</p>
                    <p><strong>Reorder Level:</strong> ${product.reorderLevel}</p>
                    <p><strong>Lead Time:</strong> ${product.leadTime} days</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <button class="btn btn-primary" onclick="openStockModal(${product.id})">Add Stock</button>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = '<p class="no-data">✅ No low stock alerts!</p>';
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Load category filter
function loadCategoryFilter() {
    loadCategories();
    
    document.getElementById('categoryFilter').addEventListener('change', async (e) => {
        const category = e.target.value;
        
        if (!category) {
            document.getElementById('categoryProductsContainer').innerHTML = 
                '<p class="no-data">Select a category to view products</p>';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/products/category/${category}`);
            const result = await response.json();
            
            const container = document.getElementById('categoryProductsContainer');
            
            if (result.success && result.data.length > 0) {
                container.innerHTML = result.data.map(product => `
                    <div class="product-card">
                        <h3>${product.name}</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            <p><strong>Price:</strong> ₹${product.price.toFixed(2)}</p>
                            <p><strong>Reorder Level:</strong> ${product.reorderLevel}</p>
                            <p><strong>Lead Time:</strong> ${product.leadTime} days</p>
                            <p><strong>Status:</strong> ${product.quantity <= product.reorderLevel ? '🔴 Low Stock' : '🟢 In Stock'}</p>
                        </div>
                        <div style="margin-top: 15px;">
                            <button class="btn btn-edit" onclick="openEditModal(${product.id})">✏️ Edit</button>
                            <button class="btn btn-stock" onclick="openStockModal(${product.id})">📦 Update Stock</button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="no-data">No products in this category</p>';
            }
        } catch (error) {
            console.error('Error loading category products:', error);
        }
    });
}

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app
loadProducts();
loadStatistics();
loadCategories();