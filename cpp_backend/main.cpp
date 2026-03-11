#include "crow.h"
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>
#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Database configuration
const string DB_HOST = "tcp://127.0.0.1:3306";
const string DB_USER = "root";
const string DB_PASS = "password";
const string DB_NAME = "ecommerce_db";

sql::Connection* get_db_connection() {
    try {
        sql::mysql::MySQL_Driver *driver;
        sql::Connection *con;
        driver = sql::mysql::get_mysql_driver_instance();
        con = driver->connect(DB_HOST, DB_USER, DB_PASS);
        con->setSchema(DB_NAME);
        return con;
    } catch (sql::SQLException &e) {
        cout << "Could not connect to database: " << e.what() << endl;
        return nullptr;
    }
}

int main() {
    crow::SimpleApp app;

    // GET /products
    CROW_ROUTE(app, "/api/products")([](){
        sql::Connection *con = get_db_connection();
        if (!con) return crow::response(500, "DB Connection Error");

        sql::Statement *stmt = con->createStatement();
        sql::ResultSet *res = stmt->executeQuery("SELECT * FROM products");

        vector<crow::json::wvalue> products;
        while (res->next()) {
            crow::json::wvalue p;
            p["id"] = res->getInt("id");
            p["name"] = res->getString("name");
            p["price"] = res->getDouble("price");
            p["image"] = res->getString("image");
            products.push_back(p);
        }

        delete res;
        delete stmt;
        delete con;
        return crow::response(crow::json::wvalue(products));
    });

    // POST /register
    CROW_ROUTE(app, "/api/register").methods("POST"_method)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400);

        sql::Connection *con = get_db_connection();
        sql::PreparedStatement *pstmt = con->prepareStatement("INSERT INTO users(name, email, password) VALUES (?, ?, ?)");
        pstmt->setString(1, x["name"].s());
        pstmt->setString(2, x["email"].s());
        pstmt->setString(3, x["password"].s()); // In real app, hash this!
        pstmt->execute();

        delete pstmt;
        delete con;
        return crow::response(200, "Registered Successfully");
    });

    // POST /login
    CROW_ROUTE(app, "/api/login").methods("POST"_method)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        sql::Connection *con = get_db_connection();
        sql::PreparedStatement *pstmt = con->prepareStatement("SELECT id, name FROM users WHERE email = ? AND password = ?");
        pstmt->setString(1, x["email"].s());
        pstmt->setString(2, x["password"].s());
        sql::ResultSet *res = pstmt->executeQuery();

        if (res->next()) {
            crow::json::wvalue user;
            user["id"] = res->getInt("id");
            user["name"] = res->getString("name");
            delete res; delete pstmt; delete con;
            return crow::response(user);
        }

        delete res; delete pstmt; delete con;
        return crow::response(401, "Invalid Credentials");
    });

    // POST /cart
    CROW_ROUTE(app, "/api/cart").methods("POST"_method)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        sql::Connection *con = get_db_connection();
        sql::PreparedStatement *pstmt = con->prepareStatement("INSERT INTO cart(user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?");
        pstmt->setInt(1, x["userId"].i());
        pstmt->setInt(2, x["productId"].i());
        pstmt->setInt(3, 1);
        pstmt->setInt(4, 1);
        pstmt->execute();

        delete pstmt; delete con;
        return crow::response(200, "Added to cart");
    });

    app.port(8080).multithreaded().run();
}
