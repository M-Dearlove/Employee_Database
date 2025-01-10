import inquirer from 'inquirer';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: process.env.DB_NAME,
    port: 5432,
});

const connectToDb = async () => {
    try {
        await pool.connect();
    } catch (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
}

const questions = [
    {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee Role'
        ]
    }
]

function init() {
    connectToDb();
    inquirer.prompt(questions).then((choice) => {
        console.log(choice);
        if (choice.choice === 'View All Departments') {
            console.log('success');
            pool.query('SELECT * from department')
                .then(result => {
                    console.table(result.rows);
                    init();
                })
                .catch(err => {
                    console.error(err);
                });
        } else if (choice.choice === 'View All Roles') {
            pool.query(`
                Select
                    role.id,
                    role.title,
                    role.salary,
                    role.department_id,
                    department.name
                FROM role
                JOIN department ON role.department_id = department.id`)
                .then(result => {
                    console.table(result.rows);
                    init();
                })
                .catch(err => {
                    console.error(err);
                });
        } else if (choice.choice === 'View All Employees') {
            pool.query(`
                SELECT 
                    employee.id AS ID, 
                    employee.first_name AS First_Name, 
                    employee.last_name AS Last_Name, 
                    role.title AS Job_Title, 
                    role.salary AS Salary, 
                    role.department_id, 
                    employee.manager_id 
                FROM employee 
                JOIN role ON employee.role_id = role.id`)
                .then(result => {
                    console.table(result.rows);
                    init();
                })
                .catch(err => {
                    console.error(err);
                });
        } else if (choice.choice === 'Add a Department') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'departmentName',
                    message: 'What is the Department Name?',
                }
            ]).then((answer) => {
                const departmentQuery = {
                    text: 'INSERT INTO department(name) VALUES($1)',
                    values: [answer.departmentName]
                };

                pool.query(departmentQuery)
                    .then(() => console.log('Department added!'))
                    .catch(err => console.error(err));

                init();
            });
        } else if (choice.choice === 'Add a Role') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'roleName',
                    message: 'What is the Role Name?',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary for this role?',
                },
                {
                    type: 'input',
                    name: 'department',
                    message: 'What department is this role in?',
                }
            ]).then((answer) => {
                const roleQuery = {
                    text: 'INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)',
                    values: [answer.roleName, answer.salary, answer.department]
                };

                pool.query(roleQuery)
                    .then(() => console.log('Role added!'))
                    .catch(err => console.error(err));

                init();
            });
        } else if (choice.choice === 'Add an Employee') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'What is their first name?',
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is their last name?',
                },
                {
                    type: 'input',
                    name: 'role',
                    message: 'What is their role?',
                },
                {
                    type: 'input',
                    name: 'manager',
                    message: 'Who is their manager?',
                }
            ]).then((answer) => {
                const employeeQuery = {
                    text: 'INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES($1, $2, $3, $4)',
                    values: [answer.firstName, answer.lastName, answer.role, answer.manager]
                };

                pool.query(employeeQuery)
                    .then(() => console.log('Employee added!'))
                    .catch(err => console.error(err));

                init();
            });
        } else if (choice.choice === 'Update an Employee Role') {
            const query = `
                SELECT first_name, last_name, id
                FROM employee;
            `;

            const result = pool.query(query)
                .then((data) => {
                    const choices = data.rows.map(row => {
                        return { name: row.first_name + row.last_name, value: row.id }
                    })
                    const prompts = [{
                        type: 'list',
                        name: 'firstName',
                        message: 'Which Employee would you like to update?',
                        choices: choices,
                    }];

                    const answer = inquirer.prompt(prompts)
                        .then((answer) => {
                            const roleQuery = `
                                SELECT title
                                FROM role;
                            `;

                            const roleResult = pool.query(roleQuery)
                                .then((roleData) => {
                                    const roles = roleData.rows.map(row => {
                                        return { name: row.title, value: row.id }
                                    })

                                    const rolePrompts = [{
                                        type: 'list',
                                        name: 'role',
                                        message: 'Which role would you like to give them?',
                                        choices: roles,
                                    }];

                                    const roleAnswer = inquirer.prompt(rolePrompts)
                                        .then((roleAnswer) => {
                                            console.log(roleAnswer);
                                            const updateQuery = `
                                                UPDATE employee
                                                SET role.title = $1
                                                WHERE id = $2
                                            `;

                                            pool.query(updateQuery, [roleAnswer.role, answer.firstName])

                                            init();
                                        })
                                });
                        })
                });
        }
    })
}

init();