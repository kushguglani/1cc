const mongoose = require('mongoose');

const GymCrewMemberSchema = mongoose.Schema({
    name: { type: String },
    userName: { type: String, unique: true,required: true },
    mobile: { type: String},
    email: { type: String, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    specialization: { type: String },
    experience: { type: String },
    aboutYpu: { type: String },
    dob: { type: String },
    gender: { type: String },
    height: { type: String },
    weight: { type: String },
    profilePic: { type: String },
    achievements: { type: String },
    status: { type: Number, required: true, default:1 },
    active: { type: Number, required: true, default:1 },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List', required: true },
    // gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }]
});

GymCrewMemberSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});


const GymCrew = mongoose.model('Gym_Crew', GymCrewMemberSchema);


module.exports = GymCrew;