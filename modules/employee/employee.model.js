const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    name: { type: String, required: true },
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resumeUploaded: { type: String },
    notification: { type: Array },
    active: { type: String, required: true, default:'1' },
    created: { type: Date, default: Date.now },
    updated: { type: Date }
});

EmployeeSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});


const Employees = mongoose.model('Employees', EmployeeSchema);


module.exports = Employees;