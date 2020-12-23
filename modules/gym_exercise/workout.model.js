const mongoose = require('mongoose');

const WorkoutSchema = mongoose.Schema({
    name: { type: String, required: true },
    subCategory: { type: Array },
    data: { type: Array, required: true }
})

WorkoutSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
})
const Gym_Workout = mongoose.model('Gym_Workout', WorkoutSchema);

module.exports = Gym_Workout;