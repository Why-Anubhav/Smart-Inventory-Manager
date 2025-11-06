#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <algorithm>
#include <iomanip>
#include <ctime>
#include <limits> // for cin.ignore fix

using namespace std;

// Product class to store product information
class Product {
private:
    int id;
    string name;
    int quantity;
    double price;
    int reorderLevel;
    int leadTime; // days
    string category;

public:
    // Default constructor
    Product() : id(0), name(""), quantity(0), price(0.0), reorderLevel(0), leadTime(0), category("Other") {}

    // Parameterized constructor
    Product(int id, string name, int qty, double price, int reorder, int lead, string cat)
        : id(id), name(name), quantity(qty), price(price),
          reorderLevel(reorder), leadTime(lead), category(cat) {}

    // Getters
    int getId() const { return id; }
    string getName() const { return name; }
    int getQuantity() const { return quantity; }
    double getPrice() const { return price; }
    int getReorderLevel() const { return reorderLevel; }
    int getLeadTime() const { return leadTime; }
    string getCategory() const { return category; }

    // Setters
    void setQuantity(int qty) { quantity = qty; }
    void setPrice(double p) { price = p; }
    void setReorderLevel(int level) { reorderLevel = level; }

    // Check if stock is low
    bool isLowStock() const {
        return quantity <= reorderLevel;
    }

    // Add stock
    void addStock(int amount) {
        quantity += amount;
    }

    // Remove stock
    bool removeStock(int amount) {
        if (quantity >= amount) {
            quantity -= amount;
            return true;
        }
        return false;
    }

    // Display product details
    void display() const {
        cout << left << setw(5) << id
             << setw(20) << name
             << setw(10) << quantity
             << "₹" << setw(10) << fixed << setprecision(2) << price
             << setw(12) << reorderLevel
             << setw(10) << leadTime
             << setw(15) << category;

        if (isLowStock()) {
            cout << " [LOW STOCK!]";
        }
        cout << endl;
    }
};

// Inventory Manager class
class InventoryManager {
private:
    map<int, Product> inventory; // Using map for O(log n) lookup
    vector<string> categories;
    int nextId;

public:
    InventoryManager() : nextId(1) {
        categories = {"Electronics", "Clothing", "Food", "Furniture", "Books", "Other"};
    }

    // Add a new product
    void addProduct() {
        string name, category;
        int qty, reorder, lead;
        double price;

        cout << "\n=== Add New Product ===" << endl;
        cout << "Enter product name: ";
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        getline(cin, name);

        cout << "Enter quantity: ";
        cin >> qty;

        cout << "Enter price (₹): ";
        cin >> price;

        cout << "Enter reorder level: ";
        cin >> reorder;

        cout << "Enter lead time (days): ";
        cin >> lead;

        cout << "\nAvailable categories:" << endl;
        for (size_t i = 0; i < categories.size(); i++) {
            cout << i + 1 << ". " << categories[i] << endl;
        }
        cout << "Select category (1-" << categories.size() << "): ";
        int catChoice;
        cin >> catChoice;
        category = (catChoice > 0 && catChoice <= (int)categories.size())
                   ? categories[catChoice - 1] : "Other";

        Product newProduct(nextId, name, qty, price, reorder, lead, category);

        // ✅ Fixed line: use emplace instead of operator[]
        inventory.emplace(nextId, newProduct);

        cout << "\n✓ Product added successfully with ID: " << nextId << endl;
        nextId++;
    }

    // View all products
    void viewAllProducts() {
        if (inventory.empty()) {
            cout << "\nNo products in inventory!" << endl;
            return;
        }

        cout << "\n=== Inventory List ===" << endl;
        cout << left << setw(5) << "ID"
             << setw(20) << "Name"
             << setw(10) << "Quantity"
             << setw(11) << "Price"
             << setw(12) << "Reorder Lvl"
             << setw(10) << "Lead Time"
             << setw(15) << "Category" << endl;
        cout << string(90, '-') << endl;

        for (auto& pair : inventory) {
            pair.second.display();
        }
    }

    // Search product by ID
    void searchProduct() {
        int id;
        cout << "\nEnter product ID: ";
        cin >> id;

        auto it = inventory.find(id);
        if (it != inventory.end()) {
            cout << "\n=== Product Found ===" << endl;
            cout << left << setw(5) << "ID"
                 << setw(20) << "Name"
                 << setw(10) << "Quantity"
                 << setw(11) << "Price"
                 << setw(12) << "Reorder Lvl"
                 << setw(10) << "Lead Time"
                 << setw(15) << "Category" << endl;
            cout << string(90, '-') << endl;
            it->second.display();
        } else {
            cout << "\n✗ Product not found!" << endl;
        }
    }

    // Update stock
    void updateStock() {
        int id, amount;
        char operation;

        cout << "\nEnter product ID: ";
        cin >> id;

        auto it = inventory.find(id);
        if (it == inventory.end()) {
            cout << "\n✗ Product not found!" << endl;
            return;
        }

        cout << "Current quantity: " << it->second.getQuantity() << endl;
        cout << "Add (A) or Remove (R) stock? ";
        cin >> operation;
        cout << "Enter amount: ";
        cin >> amount;

        if (toupper(operation) == 'A') {
            it->second.addStock(amount);
            cout << "\n✓ Stock added successfully!" << endl;
        } else if (toupper(operation) == 'R') {
            if (it->second.removeStock(amount)) {
                cout << "\n✓ Stock removed successfully!" << endl;
            } else {
                cout << "\n✗ Insufficient stock!" << endl;
            }
        } else {
            cout << "\n✗ Invalid operation!" << endl;
        }

        cout << "New quantity: " << it->second.getQuantity() << endl;
    }

    // View low stock alerts
    void viewLowStockAlerts() {
        cout << "\n=== Low Stock Alerts ===" << endl;
        bool foundLowStock = false;

        for (auto& pair : inventory) {
            if (pair.second.isLowStock()) {
                if (!foundLowStock) {
                    cout << left << setw(5) << "ID"
                         << setw(20) << "Name"
                         << setw(10) << "Quantity"
                         << setw(12) << "Reorder Lvl"
                         << setw(10) << "Lead Time" << endl;
                    cout << string(60, '-') << endl;
                    foundLowStock = true;
                }
                cout << left << setw(5) << pair.second.getId()
                     << setw(20) << pair.second.getName()
                     << setw(10) << pair.second.getQuantity()
                     << setw(12) << pair.second.getReorderLevel()
                     << setw(10) << pair.second.getLeadTime() << " days" << endl;
            }
        }

        if (!foundLowStock) {
            cout << "All products are adequately stocked!" << endl;
        }
    }

    // View products by category
    void viewByCategory() {
        cout << "\nAvailable categories:" << endl;
        for (size_t i = 0; i < categories.size(); i++) {
            cout << i + 1 << ". " << categories[i] << endl;
        }

        int choice;
        cout << "Select category: ";
        cin >> choice;

        if (choice < 1 || choice > (int)categories.size()) {
            cout << "\n✗ Invalid category!" << endl;
            return;
        }

        string selectedCategory = categories[choice - 1];
        cout << "\n=== Products in " << selectedCategory << " ===" << endl;

        bool found = false;
        for (auto& pair : inventory) {
            if (pair.second.getCategory() == selectedCategory) {
                if (!found) {
                    cout << left << setw(5) << "ID"
                         << setw(20) << "Name"
                         << setw(10) << "Quantity"
                         << setw(11) << "Price" << endl;
                    cout << string(50, '-') << endl;
                    found = true;
                }
                pair.second.display();
            }
        }

        if (!found) {
            cout << "No products in this category!" << endl;
        }
    }

    // Calculate total inventory value
    void calculateInventoryValue() {
        double totalValue = 0;
        int totalProducts = 0;

        for (auto& pair : inventory) {
            totalValue += pair.second.getQuantity() * pair.second.getPrice();
            totalProducts += pair.second.getQuantity();
        }

        cout << "\n=== Inventory Summary ===" << endl;
        cout << "Total unique products: " << inventory.size() << endl;
        cout << "Total items in stock: " << totalProducts << endl;
        cout << "Total inventory value: ₹" << fixed << setprecision(2) << totalValue << endl;
    }

    // Delete product
    void deleteProduct() {
        int id;
        cout << "\nEnter product ID to delete: ";
        cin >> id;

        auto it = inventory.find(id);
        if (it != inventory.end()) {
            cout << "Delete product: " << it->second.getName() << "? (Y/N): ";
            char confirm;
            cin >> confirm;
            if (toupper(confirm) == 'Y') {
                inventory.erase(it);
                cout << "\n✓ Product deleted successfully!" << endl;
            } else {
                cout << "\nDeletion cancelled." << endl;
            }
        } else {
            cout << "\n✗ Product not found!" << endl;
        }
    }
};

// Main function with menu
int main() {
    InventoryManager manager;
    int choice;

    cout << "=== Smart Inventory Manager (₹ Version) ===" << endl;

    while (true) {
        cout << "\n┌─────────────────────────────────┐" << endl;
        cout << "│   SMART INVENTORY MANAGER       │" << endl;
        cout << "├─────────────────────────────────┤" << endl;
        cout << "│ 1. Add New Product              │" << endl;
        cout << "│ 2. View All Products            │" << endl;
        cout << "│ 3. Search Product               │" << endl;
        cout << "│ 4. Update Stock                 │" << endl;
        cout << "│ 5. View Low Stock Alerts        │" << endl;
        cout << "│ 6. View Products by Category    │" << endl;
        cout << "│ 7. Calculate Inventory Value    │" << endl;
        cout << "│ 8. Delete Product               │" << endl;
        cout << "│ 0. Exit                         │" << endl;
        cout << "└─────────────────────────────────┘" << endl;
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1: manager.addProduct(); break;
            case 2: manager.viewAllProducts(); break;
            case 3: manager.searchProduct(); break;
            case 4: manager.updateStock(); break;
            case 5: manager.viewLowStockAlerts(); break;
            case 6: manager.viewByCategory(); break;
            case 7: manager.calculateInventoryValue(); break;
            case 8: manager.deleteProduct(); break;
            case 0:
                cout << "\nThank you for using Smart Inventory Manager!" << endl;
                return 0;
            default:
                cout << "\n✗ Invalid choice! Please try again." << endl;
        }
    }

    return 0;
}
