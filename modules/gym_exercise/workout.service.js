const db = require('../../helpers/db');
const WorkOut = db.GymWorkout;

module.exports = {
    create,
    getExercise
}

async function create(data) {
    console.log(data);
    const workout = new WorkOut(data);
    return workout.save();
}

async function getExercise() {
    return await WorkOut.find({});
}