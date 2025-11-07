const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// In-memory database (simulating the C++ backend)
let inventory = [];
let nextId = 1;
const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Books', 'Other'];

// Routes

// Get all products
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: inventory,
        count: inventory.length
    });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const product = inventory.find(p => p.id === parseInt(req.params.id));
    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

// Add new product
app.post('/api/products', (req, res) => {
    const { name, quantity, price, reorderLevel, leadTime, category } = req.body;
    
    // Validation
    if (!name || quantity < 0 || price < 0 || reorderLevel < 0 || leadTime < 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid input data' 
        });
    }

    const newProduct = {
        id: nextId++,
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        reorderLevel: parseInt(reorderLevel),
        leadTime: parseInt(leadTime),
        category: category || 'Other',
        createdAt: new Date().toISOString()
    };

    inventory.push(newProduct);
    res.status(201).json({ 
        success: true, 
        data: newProduct,
        message: 'Product added successfully' 
    });
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const productIndex = inventory.findIndex(p => p.id === parseInt(req.params.id));
    
    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, quantity, price, reorderLevel, leadTime, category } = req.body;
    
    inventory[productIndex] = {
        ...inventory[productIndex],
        name: name || inventory[productIndex].name,
        quantity: quantity !== undefined ? parseInt(quantity) : inventory[productIndex].quantity,
        price: price !== undefined ? parseFloat(price) : inventory[productIndex].price,
        reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel) : inventory[productIndex].reorderLevel,
        leadTime: leadTime !== undefined ? parseInt(leadTime) : inventory[productIndex].leadTime,
        category: category || inventory[productIndex].category,
        updatedAt: new Date().toISOString()
    };

    res.json({ 
        success: true, 
        data: inventory[productIndex],
        message: 'Product updated successfully' 
    });
});

// Update stock (add/remove)
app.patch('/api/products/:id/stock', (req, res) => {
    const product = inventory.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { operation, amount } = req.body;
    
    if (operation === 'add') {
        product.quantity += parseInt(amount);
        res.json({ 
            success: true, 
            data: product,
            message: 'Stock added successfully' 
        });
    } else if (operation === 'remove') {
        if (product.quantity >= parseInt(amount)) {
            product.quantity -= parseInt(amount);
            res.json({ 
                success: true, 
                data: product,
                message: 'Stock removed successfully' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Insufficient stock' 
            });
        }
    } else {
        res.status(400).json({ 
            success: false, 
            message: 'Invalid operation' 
        });
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    const productIndex = inventory.findIndex(p => p.id === parseInt(req.params.id));
    
    if (productIndex === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    inventory.splice(productIndex, 1);
    res.json({ 
        success: true, 
        message: 'Product deleted successfully' 
    });
});

// Get low stock alerts
app.get('/api/products/alerts/low-stock', (req, res) => {
    const lowStockProducts = inventory.filter(p => p.quantity <= p.reorderLevel);
    res.json({
        success: true,
        data: lowStockProducts,
        count: lowStockProducts.length
    });
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
    const categoryProducts = inventory.filter(p => 
        p.category.toLowerCase() === req.params.category.toLowerCase()
    );
    res.json({
        success: true,
        data: categoryProducts,
        count: categoryProducts.length
    });
});

// Get inventory statistics
app.get('/api/statistics', (req, res) => {
    const totalProducts = inventory.length;
    const totalItems = inventory.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = inventory.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const lowStockCount = inventory.filter(p => p.quantity <= p.reorderLevel).length;

    res.json({
        success: true,
        data: {
            totalProducts,
            totalItems,
            totalValue: totalValue.toFixed(2),
            lowStockCount,
            categories: categories
        }
    });
});

// Get categories
app.get('/api/categories', (req, res) => {
    res.json({
        success: true,
        data: categories
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});