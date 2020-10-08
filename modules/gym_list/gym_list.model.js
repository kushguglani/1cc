const mongoose = require('mongoose');

const GymMemberSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    map_address: { type: String, required: true },
    mobile: { type: String, unique: true},
    email: { type: String, unique: true},
    // owner_gym_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List' }],
    // gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }]
});

GymMemberSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});


const GymMember = mongoose.model('GymMember', GymMemberSchema);


module.exports = GymMember;