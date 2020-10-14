const mongoose = require('mongoose');

const ManagerSchema = mongoose.Schema({
    name: { type: String, required: true },
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    active: { type: String, required: true, default: '1' },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
});

ManagerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});


const Managers = mongoose.model('Managers', ManagerSchema);


module.exports = Managers;