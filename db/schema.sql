DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;


CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id) 
    REFERENCES department(id)
    ON DELETE SET NULL
);


CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT NULL,
    FOREIGN KEY (role_id) 
    REFERENCES roles(id)
    ON DELETE SET NULL
);



