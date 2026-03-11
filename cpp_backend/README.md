# C++ E-Commerce Backend (Crow + MySQL)

This directory contains the source code for the C++ backend as requested.

## Prerequisites
1. **C++ Compiler**: GCC or Clang (C++17 or higher).
2. **Crow Framework**: [CrowCpp/Crow](https://github.com/CrowCpp/Crow)
3. **MySQL Connector/C++**: [MySQL Connector/C++](https://dev.mysql.com/downloads/connector/cpp/)
4. **MySQL Server**: Installed and running.

## Database Setup
Run the following SQL commands in your MySQL client:

```sql
CREATE DATABASE ecommerce_db;
USE ecommerce_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL
);

CREATE TABLE cart (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed some products
INSERT INTO products (name, price, image) VALUES 
('Minimalist Watch', 2499.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'),
('Leather Wallet', 1299.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93');
```

## How to Build and Run
1. Install dependencies (Crow and MySQL Connector).
2. Compile the code:
   ```bash
   g++ main.cpp -o server -lcrow -lmysqlcppconn -lpthread
   ```
3. Run the server:
   ```bash
   ./server
   ```

## Note on Preview
The live preview in this environment uses a **Node.js/TypeScript shim** because the sandboxed environment is optimized for Node.js execution. However, the `main.cpp` file provided here contains the full logic for the C++ backend you requested.
