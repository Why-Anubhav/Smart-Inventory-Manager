📘 Smart Inventory Manager (C++)

A simple yet powerful Inventory Management System built using C++, designed to help small businesses track their stock levels, categorize products, and manage reorder alerts efficiently.

🧠 Features

✅ Add new products with unique IDs
✅ View all products with formatted output
✅ Search product by ID
✅ Update stock (add or remove quantity)
✅ View low stock alerts (auto warning when stock ≤ reorder level)
✅ Categorize products (Electronics, Food, Books, etc.)
✅ Calculate total inventory value in ₹ (Indian Rupees)
✅ Delete products safely
✅ Smart menu-driven interface

💡 Key Concepts Used

Object-Oriented Programming (OOP)

Classes & Objects (Product, InventoryManager)

Encapsulation

STL containers:

map<int, Product> for efficient lookups

vector<string> for categories

Formatting with <iomanip>

File handling (optional to add later)

Practical business logic using:

Lead Time: days required to restock

Reorder Level: minimum quantity before reordering

💻 How to Run

Clone this repository:

git clone https://github.com/<your-username>/Smart-Inventory-Manager.git


Navigate to the folder:

cd Smart-Inventory-Manager


Compile and run:

g++ inventory_manager.cpp -o inventory_manager
./inventory_manager

🪙 Example Output
=== Smart Inventory Manager (₹ Version) ===

1. Add New Product
2. View All Products
3. Search Product
...
Enter price (₹): 2500
✓ Product added successfully with ID: 1

🧾 Project Explanation
Term	Meaning
Lead Time	Days it takes to receive new stock after ordering
Reorder Level	Minimum stock before you must reorder
Low Stock Alert	Automatically triggers when stock ≤ reorder level
🧑‍💻 Author

Anubhav Yadav
🎓 B.Tech CSE @ Chandigarh University | B.Sc. Data Science @ IIT Madras
💡 Interests: Programming, Tech, and Project Building

📜 License

This project is open source under the MIT License — free to use and modify with credit.
