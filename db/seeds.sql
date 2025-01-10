INSERT INTO department (name)
VALUES ('HNDCS'),
       ('HNBHS'),
       ('HNCFA');

INSERT INTO role (title, salary, department_id)
VALUES ('Behavior Technician', 25000.00, 3),
       ('Program Manager', 35000.00, 1),
       ('Operations Manager', 55000.00, 1),
       ('Program Director', 70000.00, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Bob', 'Bobberton', 1, 2),
       ('Kathy', 'Peoples', 2, 3),
       ('Lindsey', 'Spear', 3, 4),
       ('Matt', 'Dearlove', 4, NULL);