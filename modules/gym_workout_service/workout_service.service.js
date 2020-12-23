const db = require('../../helpers/db');
const GymWorkoutService = db.GymWorkoutService;

module.exports = {
    create,
    getWorkout,
    getByParam
}

async function create(data) {
    console.log(data);
    const workout = new GymWorkoutService(data);
    return workout.save();
}

async function getByParam(param, value) {
    return await GymWorkoutService.find({ [param]: value });
}

async function getWorkout(id) {
    return await GymWorkoutService.findById(id);
}