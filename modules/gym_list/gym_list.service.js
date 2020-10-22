const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const GymList = db.GymList;
const GymOwner = db.GymOwner;

module.exports = {
    authenticate,
    updateGymOwner,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    inactive
};

async function authenticate({ userName, password }) {
    const employee = await GymList.findOne({ userName });
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
    return await GymList.find({"active":1});
}

async function getById(id) {
    return await GymList.findById(id);
}

async function create(gymListParams) {
    const gymData = new GymList(gymListParams);
    // save gymData
    return await gymData.save();
    // await gymData.save((err,obj)=>{
    //     if (err)
    //     res.send(err);
    //     return res.json({ message: 'User created!', data: obj });
    // });
}

async function updateGymOwner(ownerId, gymId) {
    const gymOwner = await GymOwner.findById(ownerId);
    // validate
    if (!gymOwner) throw 'Gym Owner not found';
    gymOwner.owner_gym_ids.push(gymId);
    return await gymOwner.save();
}

async function update(id, gymParam) {
    const gym = await GymList.findById(id);

    // validate
    if (!gym) throw 'GymList not found';
  

    gymParam.updated = new Date();
    // copy employeeParam properties to employee
    Object.assign(gym, gymParam);

    return await gym.save();
}

async function _delete(id) {
    await GymList.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await GymList.findById(id);
    // validate
    if (!employee) throw 'GymList not found';
    employee.active = 0;
    await employee.save();
}