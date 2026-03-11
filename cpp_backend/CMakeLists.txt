cmake_minimum_required(VERSION 3.10)
project(EcommerceBackend)

set(CMAKE_CXX_STANDARD 17)

# Find Crow (assuming installed via package manager or included)
# find_package(Crow REQUIRED) 

# Find MySQL Connector
find_package(MySQL REQUIRED)

add_executable(EcommerceBackend main.cpp)

target_link_libraries(EcommerceBackend PRIVATE mysqlcppconn)
