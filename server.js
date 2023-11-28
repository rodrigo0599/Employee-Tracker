require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cfonts = require("cfonts");

// Function to start the application of CFONT
cfonts.say("Employee Tracker", {
  font: "block", // define the font face
  align: "left", // define text alignment
  colors: ["gray"], // define all colors
  background: "transparent", // define the background color, you can also use `backgroundColor` here as key
  letterSpacing: 1, // define letter spacing
  lineHeight: 1, // define the line height
  space: true, // define if the output text should have empty lines on top and on the bottom
  maxLength: "0", // define how many character can be on one line
  gradient: false, // define your two gradient colors
  independentGradient: false, // define if you want to recalculate the gradient for each new line
  transitionGradient: false, // define if this is a transition between colors directly
  env: "node", // define the environment cfonts is being executed in
});

// create a MySQL connection to the database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: process.env.PASSWORD,
    database: "employees_db",
  },
  console.log("Connected to the employees_db database.")
);

// connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
  // start the application
  start();
});

// Function to Start the Application
function start() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "View Employees by Manager",
        "View Employees by Department",
        "Delete Departments | Roles | Employees",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "View Employees by Manager":
          viewEmployeesByManager();
          break;
        case "View Employees by Department":
          viewEmployeesByDepartment();
          break;
        case "Delete Departments | Roles | Employees":
          deleteDepartmentsRolesEmployees();
          break;
        case "View department budget":
          viewDepartmentBudget();
          break;
        case "Exit":
          exit();
          connection.end();
          console.log("Goodbye!");
          break;
      }
    });
}

// function to view all departments
function viewAllDepartments() {
  const query = "SELECT * FROM department";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}

// function to view all roles
function viewAllRoles() {
  const query =
    "SELECT roles.title, roles.id, department.name, roles.salary from roles join department on roles.department_id = department.id";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}

// function to view all employees
function viewAllEmployees() {
  const query = `
  SELECT e.id, e.first_name, e.last_name, r.title, d.name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
  FROM employee e
  LEFT JOIN roles r ON e.role_id = r.id
  LEFT JOIN department d ON r.department_id = d.id
  LEFT JOIN employee m ON e.manager_id = m.id;
    `;
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    // restart the application
    start();
  });
}

// function to add a department
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "name",
      message: "Enter the name of the new department:",
    })
    .then((answer) => {
      console.log(answer.name);
      const query = `INSERT INTO department (name) VALUES ("${answer.name}")`;
      db.query(query, (err, res) => {
        if (err) throw err;
        console.log(`Added department ${answer.name} to the database!`);
        // restart the application
        start();
        console.log(answer.name);
      });
    });
}

function addRole() {
  const query = "SELECT * FROM department";
  db.query(query, (err, res) => {
    if (err) throw err;
    if (
      !res ||
      res.length === 0 ||
      res.some((department) => department === undefined)
    ) {
      console.log("No departments found.");
      return;
    }
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the new role:",
        },
        {
          type: "input",
          name: "salary",
          message: "Enter the salary of the new role:",
        },
        {
          type: "list",
          name: "department",
          message: "Select the department for the new role:",
          choices: res
            .filter((department) => department !== undefined)
            .map((department) => department.name),
        },
      ])
      .then((answers) => {
        const department = res.find(
          (department) =>
            department.name.toLowerCase() === answers.department.toLowerCase()
        );
        const query = "INSERT INTO roles SET ?";
        db.query(
          query,
          {
            title: answers.title,
            salary: answers.salary,
            department_id: department.id,
          },
          (err, res) => {
            if (err) throw err;
            console.log(
              `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
            );
            // restart the application
            start();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  // Retrieve list of roles from the database
  db.query("SELECT id, title FROM roles", (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    const roles = results.map(({ id, title }) => ({
      name: title,
      value: id,
    }));

    // Retrieve list of employees from the database to use as managers
    db.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
      (error, results) => {
        if (error) {
          console.error(error);
          return;
        }

        const managers = results.map(({ id, name }) => ({
          name,
          value: id,
        }));

        // Prompt the user for employee information
        inquirer
          .prompt([
            {
              type: "input",
              name: "firstName",
              message: "Enter the employee's first name:",
            },
            {
              type: "input",
              name: "lastName",
              message: "Enter the employee's last name:",
            },
            {
              type: "list",
              name: "roleId",
              message: "Select the employee role:",
              choices: roles,
            },
            {
              type: "list",
              name: "managerId",
              message: "Select the employee manager:",
              choices: [{ name: "None", value: null }, ...managers],
            },
          ])
          .then((answers) => {
            // Insert the employee into the database
            const sql =
              "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
            const values = [
              answers.firstName,
              answers.lastName,
              answers.roleId,
              answers.managerId,
            ];
            db.query(sql, values, (error) => {
              if (error) {
                console.error(error);
                return;
              }

              console.log("Employee added successfully");
              start();
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    );
  });
}
// Function to add a Manager
function addManager() {
  const queryDepartments = "SELECT * FROM department";
  const queryEmployees = "SELECT * FROM employee";

  db.query(queryDepartments, (err, resDepartments) => {
    if (err) throw err;
    db.query(queryEmployees, (err, resEmployees) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Select the department:",
            choices: resDepartments.map(
              (department) => department.department_name
            ),
          },
          {
            type: "list",
            name: "employee",
            message: "Select the employee to add a manager to:",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: "list",
            name: "manager",
            message: "Select the employee's manager:",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
        ])
        .then((answers) => {
          const department = resDepartments.find(
            (department) => department.department_name === answers.department
          );
          const employee = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` ===
              answers.employee
          );
          const manager = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` === answers.manager
          );
          const query =
            "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
          db.query(
            query,
            [manager.id, employee.id, department.id],
            (err, res) => {
              if (err) throw err;
              console.log(
                `Added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name} in department ${department.department_name}!`
              );
              // restart the application
              start();
            }
          );
        });
    });
  });
}

// function to update an employee role
function updateEmployeeRole() {
  const queryEmployees =
    "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";
  const queryRoles = "SELECT * FROM roles";
  db.query(queryEmployees, (err, resEmployees) => {
    if (err) throw err;
    db.query(queryRoles, (err, resRoles) => {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Select the employee to update:",
            choices: resEmployees.map(
              (employee) => `${employee.first_name} ${employee.last_name}`
            ),
          },
          {
            type: "list",
            name: "role",
            message: "Select the new role:",
            choices: resRoles.map((role) => role.title),
          },
        ])
        .then((answers) => {
          const employee = resEmployees.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` ===
              answers.employee
          );
          const role = resRoles.find((role) => role.title === answers.role);
          const query = "UPDATE employee SET role_id = ? WHERE id = ?";
          db.query(query, [role.id, employee.id], (err, res) => {
            if (err) throw err;
            console.log(
              `Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`
            );
            // restart the application
            start();
          });
        });
    });
  });
}

// Function to View Employee By Manager
function viewEmployeesByManager() {
  const query = `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        r.title, 
        d.name AS department_name, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM 
        employee e
        INNER JOIN roles r ON e.role_id = r.id
        INNER JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY 
        manager_name, 
        e.last_name, 
        e.first_name
    `;

  db.query(query, (err, res) => {
    if (err) throw err;

    // group employees by manager
    const employeesByManager = res.reduce((acc, cur) => {
      const managerName = cur.manager_name;
      if (acc[managerName]) {
        acc[managerName].push(cur);
      } else {
        acc[managerName] = [cur];
      }
      return acc;
    }, {});

    // display employees by manager
    console.log("Employees by manager:");
    for (const managerName in employeesByManager) {
      console.log(`\n${managerName}:`);
      const employees = employeesByManager[managerName];
      employees.forEach((employee) => {
        console.log(
          `  ${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`
        );
      });
    }

    // restart the application
    start();
  });
}
// Function to view Employees by Department
function viewEmployeesByDepartment() {
  const query =
    "SELECT department.name AS department_name, employee.first_name, employee.last_name FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN department ON roles.department_id = department.id ORDER BY department.name ASC";

  db.query(query, (err, res) => {
    if (err) throw err;
    console.log("\nEmployees by department:");
    console.table(res);
    // restart the application
    start();
  });
}
// Function to DELETE Departments Roles Employees
function deleteDepartmentsRolesEmployees() {
  inquirer
    .prompt({
      type: "list",
      name: "data",
      message: "What would you like to delete?",
      choices: ["Employee", "Role", "Department"],
    })
    .then((answer) => {
      switch (answer.data) {
        case "Employee":
          deleteEmployee();
          break;
        case "Role":
          deleteRole();
          break;
        case "Department":
          deleteDepartment();
          break;
        default:
          console.log(`Invalid data: ${answer.data}`);
          start();
          break;
      }
    });
}
// Function to DELETE Employees
function deleteEmployee() {
  const query = "SELECT * FROM employee";
  db.query(query, (err, res) => {
    if (err) throw err;
    const employeeList = res.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    employeeList.push({ name: "Go Back", value: "back" }); // add a "back" option
    inquirer
      .prompt({
        type: "list",
        name: "id",
        message: "Select the employee you want to delete:",
        choices: employeeList,
      })
      .then((answer) => {
        if (answer.id === "back") {
          // check if user selected "back"
          deleteDepartmentsRolesEmployees();
          return;
        }
        const query = "DELETE FROM employee WHERE id = ?";
        db.query(query, [answer.id], (err, res) => {
          if (err) throw err;
          console.log(
            `Deleted employee with ID ${answer.id} from the database!`
          );
          // restart the application
          start();
        });
      });
  });
}
// Function to DELETE ROLE
function deleteRole() {
  // retrieve all available roles from the database
  const query = "SELECT * FROM roles";
  db.query(query, (err, res) => {
    if (err) throw err;
    const choices = res.map((role) => ({
      name: `${role.title} (${role.id}) - ${role.salary}`,
      value: role.id,
    }));
    choices.push({ name: "Go Back", value: null });
    inquirer
      .prompt({
        type: "list",
        name: "roleId",
        message: "Select the role you want to delete:",
        choices: choices,
      })
      .then((answer) => {
        if (answer.roleId === null) {
          deleteDepartmentsRolesEmployees();
          return;
        }
        const query = "DELETE FROM roles WHERE id = ?";
        db.query(query, [answer.roleId], (err, res) => {
          if (err) throw err;
          console.log(
            `Deleted role with ID ${answer.roleId} from the database!`
          );
          start();
        });
      });
  });
}
// Fuction to DELETE Department
function deleteDepartment() {
  // get the list of departments
  const query = "SELECT * FROM department";
  db.query(query, (err, res) => {
    if (err) throw err;
    const departmentChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));

    // prompt the user to select a department
    inquirer
      .prompt({
        type: "list",
        name: "departmentId",
        message: "Which department do you want to delete?",
        choices: [...departmentChoices, { name: "Go Back", value: "back" }],
      })
      .then((answer) => {
        if (answer.departmentId === "back") {
          deleteDepartmentsRolesEmployees();
        } else {
          const query = "DELETE FROM department WHERE id = ?";
          db.query(query, [answer.departmentId], (err, res) => {
            if (err) throw err;
            console.log(
              `Deleted department with ID ${answer.departmentId} from the database!`
            );
            start();
          });
        }
      });
  });
}
function viewDepartmentBudget() {
  const query = "SELECT * FROM departments";
  db.query(query, (err, res) => {
    if (err) throw err;
    const departmentChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));
  });
}

// exit the application
const exit = () => {
  if ("Exit") {
    console.log("Goodbye!");
    process.exit();
  }
};
