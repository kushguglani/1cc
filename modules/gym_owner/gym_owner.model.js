const mongoose = require('mongoose');

const GymOwnerSchema = mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    owner_gym_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List' }],
    gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }],
    emailVerirfied: { type: Number, required: true, default:0 },
    active: { type: Number, required: true, default:1 },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
    // password is missing
});

GymOwnerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});


const GymOwner = mongoose.model('GymOwner', GymOwnerSchema);


module.exports = GymOwner;