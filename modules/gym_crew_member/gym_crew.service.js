const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const GymCrew = db.GymCrew;
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
    const employee = await GymCrew.findOne({ userName });
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
    return await GymCrew.find({"active":1});
}

async function getById(id) {
    return await GymCrew.findById(id);
}

async function create(GymCrewParams) {
    const gymData = new GymCrew(GymCrewParams);
    return await gymData.save();
   
}

async function updateGymOwner(ownerId, gymId) {
    const gymOwner = await GymOwner.findById(ownerId);
    // validate
    if (!gymOwner) throw 'Gym Owner not found';
    gymOwner.gym_crew_member_ids.push(gymId);
    return await gymOwner.save();
}

async function update(id, gymParam) {
    const gym = await GymCrew.findById(id);

    // validate
    if (!gym) throw 'GymCrew not found';
  

    gymParam.updated = new Date();
    console.log(gymParam  );
    // copy employeeParam properties to employee
    Object.assign(gym, gymParam);

    return await gym.save();
}

async function _delete(id) {
    await GymCrew.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await GymCrew.findById(id);
    // validate
    if (!employee) throw 'GymCrew not found';
    employee.active = 0;
    await employee.save();
}