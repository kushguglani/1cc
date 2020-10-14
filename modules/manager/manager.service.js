const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('helpers/db');
const Manager = db.Manager;

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
    const manager = await Manager.findOne({ userName });
    if (manager && bcrypt.compareSync(password, manager.password)) {
        const payload = { id: manager.id, role: 'manager' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        return {
            ...manager.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await Manager.find({"active":"1"});
}

async function getById(id) {
    return await Manager.findById(id);
}

async function create(managerParam) {
    // validate
    if (await Manager.findOne({ email: managerParam.email })) {
        throw `Manager with email:${managerParam.email} already exists`;
    }
    else if (await Manager.findOne({ userName: managerParam.userName })) {
        throw `Manager with user name:${managerParam.userName} already exists`;
    }

    const manager = new Manager(managerParam);

    // hash password
    if (managerParam.password) {
        manager.password = bcrypt.hashSync(managerParam.password, 10);
    }
    // save manager
    await manager.save();
}

async function update(id, managerParam) {
    const manager = await Manager.findById(id);

    // validate
    if (!manager) throw 'Manager not found';
    if (manager.userName !== managerParam.userName && await Manager.findOne({ userName: managerParam.userName })) {
        throw 'Manager userName "' + managerParam.userName + '" is already taken';
    }
    if (manager.email !== managerParam.email && await Manager.findOne({ email: managerParam.email })) {
        throw 'Manager email "' + managerParam.email + '" is already taken';
    }
    managerParam.updated = new Date();
    // hash password if it was entered
    if (managerParam.password) {
        managerParam.hash = bcrypt.hashSync(managerParam.password, 10);
    }
    // copy managerParam properties to manager
    Object.assign(manager, managerParam);
    await manager.save();
}

async function _delete(id) {
    await Manager.findByIdAndRemove(id);
}

async function inactive(id) {
    const manager = await Manager.findById(id);
    // validate
    if (!manager) throw 'Manager not found';
    manager.active = 0;
    await manager.save();
}