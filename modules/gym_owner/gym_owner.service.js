const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('helpers/db');
const Employee = db.Employee;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    inactive
};

async function authenticate({ userName, password }) {
    const employee = await Employee.findOne({ userName });
    if (employee && bcrypt.compareSync(password, employee.password)) {
        const payload = { id: employee.id, role: 'employee' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        return {
            ...employee.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await Employee.find({"active":1});
}

async function getById(id) {
    return await Employee.findById(id);
}

async function create(employeeParam) {
    // validate
    if (await Employee.findOne({ email: employeeParam.email })) {
        throw `Employee with email:${employeeParam.email} already exists`;
    }
    else if (await Employee.findOne({ userName: employeeParam.userName })) {
        throw `Employee with user name:${employeeParam.userName} already exists`;
    }

    const employee = new Employee(employeeParam);

    // hash password
    if (employeeParam.password) {
        employee.password = bcrypt.hashSync(employeeParam.password, 10);
    }
    // save employee
    await employee.save();
}

async function update(id, employeeParam) {
    const employee = await Employee.findById(id);

    // validate
    if (!employee) throw 'Employee not found';
    if (employee.employeename !== employeeParam.employeename && await Employee.findOne({ employeename: employeeParam.employeename })) {
        throw 'Employeename "' + employeeParam.employeename + '" is already taken';
    }

    // hash password if it was entered
    if (employeeParam.password) {
        employeeParam.hash = bcrypt.hashSync(employeeParam.password, 10);
    }
    employeeParam.updated = new Date();
    // copy employeeParam properties to employee
    Object.assign(employee, employeeParam);

    await employee.save();
}

async function _delete(id) {
    await Employee.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await Employee.findById(id);
    // validate
    if (!employee) throw 'Employee not found';
    employee.active = 0;
    await employee.save();
}