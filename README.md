# 🧠 Smart Inventory Manager (C++)

A console-based **Inventory Management System** built using **C++**, designed to help users efficiently manage stock, track product categories, monitor low-stock alerts, and calculate inventory value in ₹ (Indian Rupees).

---

## 🚀 Features

✅ Add new products with unique IDs  
✅ View all products in a formatted tabular view  
✅ Search for products by ID  
✅ Update stock (add or remove quantity)  
✅ Display low-stock alerts automatically  
✅ Categorize products (Electronics, Food, Books, etc.)  
✅ Calculate total inventory value in ₹  
✅ Delete existing products  
✅ Interactive and user-friendly CLI interface  

---

## ⚙️ Key Concepts Used

- **Object-Oriented Programming (OOP)**
  - Classes & Objects (`Product`, `InventoryManager`)
  - Data encapsulation and abstraction
- **Standard Template Library (STL)**
  - `map<int, Product>` for fast product lookup
  - `vector<string>` for category management
- **Formatting and Alignment** using `<iomanip>`
- **Practical Business Logic:**      
  - **Lead Time:** Number of days required to restock an item
  - **Reorder Level:** Minimum stock before a reorder is required

---

## 💻 How to Run

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/Smart-Inventory-Manager.git
