const db = require('../../helpers/db');
const Workout = require('./workout.model');
const WorkOut = db.WorkOut;

module.exports = {
    create,
    getWorkout
}

async function create(data) {
    console.log(data);
    const workout = new Workout(data);
    return workout.save();
}

async function getWorkout() {
    return await Workout.find({});
}