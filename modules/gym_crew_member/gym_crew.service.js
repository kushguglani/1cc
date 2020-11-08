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
    inactive,
    getByOwnerId
};

async function authenticate({ userName, password }) {
    const crew = await GymCrew.findOne({ userName });
    if (crew && bcrypt.compareSync(password, crew.password)) {
        const payload = { id: crew.id, role: 'crew' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        return {
            ...crew.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await GymCrew.find({ "active": 1 });
}

async function getById(id) {
    return await GymCrew.findById(id);
}

async function getByOwnerId(id) {
    return await GymCrew.find({ "owner_id": id });
}

async function create(GymCrewParams) {
    // const gymData = new GymCrew(GymCrewParams);
    // return await gymData.save();
    // fetch gym id from owner
    const gymOwner = await GymOwner.findById(GymCrewParams.owner_id);
    console.log(gymOwner);
    GymCrewParams.owner_gym_id = gymOwner.owner_gym_id;
    // validate
    if (await GymCrew.findOne({ userName: GymCrewParams.userName })) {
        throw `Crew Member with userName:${GymCrewParams.userName} already exists`;
    }
    const crew = new GymCrew(GymCrewParams);
    console.log(crew);
    // hash password
    if (GymCrewParams.password) {
        crew.password = bcrypt.hashSync(GymCrewParams.password, 10);
    }
    // save employee
    return await crew.save();
}

async function updateGymOwner(ownerId, gymId) {
    const gymOwner = await GymOwner.findById(ownerId);
    console.log(gymOwner);
    // validate
    if (!gymOwner) throw 'Gym Owner not found';
    gymOwner.gym_crew_member_ids.push(gymId);
    return await gymOwner.save();
}

async function update(id, crewParam) {
    const crew = await GymCrew.findById(id);

    // validate
    if (!crew) throw 'GymCrew not found';

    if (crewParam.userName && crew.userName !== crewParam.userName && await GymOwner.findOne({ userName: crewParam.userName })) {
        throw 'Crew "' + crewParam.userName + '" is already taken';
    }
    crewParam.updated = new Date();
    console.log(crewParam);
    // copy employeeParam properties to employee
    Object.assign(crew, crewParam);

    return await crew.save();
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