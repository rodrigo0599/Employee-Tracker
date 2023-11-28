-- Insert data into the Department table
INSERT INTO department(name)
VALUES ("Management"),
       ("Sales"),
       ("Tech"),
       ("Customer Service");

-- Seed the role table
INSERT INTO roles(title, salary, department_id)
VALUES ("Manager", 131000, 1),
       ("Engineer", 11000, 2),
       ("Technician", 95000, 3),
       ("Sales", 88000, 4);

-- Insert data into the Employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Robert', 'Johnson', 3, 5),
('Alice', 'Brown', 4, 5),
('Charlie', 'Davis', 2, 2),
('Eve', 'Foster', 1, 2),
('Grace', 'Harris', 4, 2);
