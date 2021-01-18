const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const GymPost = db.GymPost;
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
    inactive,
    getByParam,
    getByDate,
    getGymById,
    likePost
};

async function authenticate({ userName, password }) {
    const employee = await GymPost.findOne({ userName });
    if (employee && bcrypt.compareSync(password, employee.password)) {
        const payload = { id: employee.id, role: 'employee' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        return {
            ...employee.toJSON(),
            token
        };
    }
}

async function getByDate() {
    let todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    // var cutoff = new Date();
    // cutoff.setDate(cutoff.getDay());
    return await GymPost.find({ created: { $gte: todayDate } });
}

async function getByParam(param, value) {
    return await GymPost.find({ [param]: value });
}
async function getAll() {
    return await GymPost.find({ "active": 1 });
}

async function getById(id) {
    return await GymPost.findById(id);
}

async function create(gymPostParams) {
    const gymData = new GymPost(gymPostParams);
    // save gymPost
    return await gymData.save();
}

async function updateGymOwner(ownerId, gymId) {
    const gymOwner = await GymOwner.findById(ownerId);
    // validate
    if (!gymOwner) throw 'Gym Owner not found';
    gymOwner.gym_post_ids.push(gymId);
    return await gymOwner.save();
}

async function update(id, gymParam) {
    const gym = await GymPost.findById(id);

    // validate
    if (!gym) throw 'GymPost not found';


    gymParam.updated = new Date();
    // copy employeeParam properties to employee
    Object.assign(gym, gymParam);

    return await gym.save();
}

async function likePost(id, user) {
    console.log(id);
    const gym = await GymPost.findById(id);

    // validate
    if (!gym) throw 'GymPost not found';
    if (!gym.likedBy.includes(user)) {
        gym.likedBy.push(user);
        ++gym.likes;
    } else {
        const index = gym.likedBy.indexOf(user);
        if (index > -1) {
            gym.likedBy.splice(index, 1);
        }
        --gym.likes;
    }
    console.log(gym);
    // return gym;
    // gymParam.updated = new Date();
    // copy employeeParam properties to employee
    // Object.assign(gym, gymParam);

    return await gym.save();
}

async function _delete(id) {
    await GymPost.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await GymPost.findById(id);
    // validate
    if (!employee) throw 'GymPost not found';
    employee.active = 0;
    await employee.save();
}

async function getGymById(id) {
    return await GymList.find(id)

}