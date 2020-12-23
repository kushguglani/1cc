const mongoose = require('mongoose');

const WorkoutSchema = mongoose.Schema({
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Member' },
    name: { type: String, required: true },
    days: { type: Array, required: true },
    exercises: { type: Object, required: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
})

WorkoutSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
})
const Gym_Workout_Serice = mongoose.model('Gym_Workout_Serice', WorkoutSchema);

module.exports = Gym_Workout_Serice; 