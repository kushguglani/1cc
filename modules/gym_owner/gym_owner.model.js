const mongoose = require('mongoose');

const GymOwnerSchema = mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    owner_gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Owner' },
    gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }],
    gym_post_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Posts' }],
    emailVerirfied: { type: Number, required: true, default:0 },
    active: { type: Number, required: true, default:1 },
    reset: { type: Number, required: true, default:0 },
    created: { type: Date, default: Date.now },
    status: { type: Number, required: true, default:1 },
    updated: { type: Date, default: Date.now }
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


const GymOwner = mongoose.model('Gym_Owner', GymOwnerSchema);


module.exports = GymOwner;