const mongoose = require('mongoose');

const GymPostSchema = mongoose.Schema({
    title: { type: String },
    purpose: { type: String },
    description: { type: String, required: true },
    type: { type: String, required: true },
    postMediaName: { type: String },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    gymData: { type: Object },
    videoPoints: { type: Number },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Owner', required: true },
    gym_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List', required: true },
    created: { type: Date, default: Date.now },
    status: { type: Number, required: true, default: 1 },
    active: { type: Number, required: true, default: 1 },
    updated: { type: Date, default: Date.now },
    likedBy: { type: Array }
    // profilePic ->string
    //gymImages -string
    //weekday of gym -[]
    //timing {open:,closed:}
    // owner_gym_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_List' }],
    // gym_crew_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym_Crew_Member' }]
});

GymPostSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});


const GymPost = mongoose.model('Gym_Post', GymPostSchema);


module.exports = GymPost;