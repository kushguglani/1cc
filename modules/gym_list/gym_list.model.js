const mongoose = require('mongoose');

const GymListSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip_code: { type: String, required: true },
    map_address: { type: String, required: true },
    mobile: { type: String},
    email: { type: String},
    active: { type: Number, required: true, default:1 },
    // owner_gym_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List' }],
    // gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }]
});

GymListSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});


const GymList = mongoose.model('GymList', GymListSchema);


module.exports = GymList;