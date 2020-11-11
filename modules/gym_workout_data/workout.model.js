const mongoose = require('mongoose');

const WorkoutSchema = mongoose.Schema({
    name: { type: String, required: true },
    subCategory: { type: Array },
    data: { type: Array, required: true }
})

WorkoutSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
})
const Workout = mongoose.model('Gym_Workout', WorkoutSchema);

module.exports = Workout;