const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const GymOwner = db.GymOwner;
const sendNodeEmail = require('../../helpers/mailerService');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    inactive,
    validateOwnerEmail,
    sendEmail
};

async function authenticate({ email, password }) {
    const owner = await GymOwner.findOne({ email });
    console.log(owner);
    if (owner && bcrypt.compareSync(password, owner.password)) {
        if (owner.emailVerirfied === 0) return { message: "Email Verification Pending", status: 0 }
        else if (owner.active === 0) return { message: "Owner is inactive", status: 0 }
        const payload = { id: owner.id, role: 'gymOwner' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
        return {
            ...owner.toJSON(),
            token
        };
    }
}

async function validateOwnerEmail(jwtID) {
    var decoded = jwt.verify(jwtID, process.env.SECRET_KEY)
    if (decoded.role !== "gymOwner") return "Owner is not valid";
    let id = decoded.id;
    const owner = await GymOwner.findOne({ "_id": id });
    if (owner) {
        owner.emailVerirfied = 1;
        await owner.save();
        return { "message": "email verified successfully", status: 0 }
    }
}

async function sendEmail(owner, host) {
    const payload = { id: owner.id, role: 'gymOwner' };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
    let link = "http://" + host + "/gym-owner/validate?id=" + token;
    let mailOptions = {
        to: owner.email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    }
    return await sendNodeEmail(mailOptions)
}

async function getAll() {
    return await GymOwner.find({ "active": 1 });
}

async function getById(id) {
    return await GymOwner.findById(id);
}

async function create(employeeParam) {
    // validate
    if (await GymOwner.findOne({ email: employeeParam.email })) {
        throw `GymOwner with email:${employeeParam.email} already exists`;
    }
    else if (await GymOwner.findOne({ mobile: employeeParam.mobile })) {
        throw `GymOwner with mobile :${employeeParam.mobile} already exists`;
    }

    const employee = new GymOwner(employeeParam);

    // hash password
    if (employeeParam.password) {
        employee.password = bcrypt.hashSync(employeeParam.password, 10);
    }
    // save employee
    return await employee.save();
}

async function update(id, ownerParam) {
    const owner = await GymOwner.findById(id);

    // validate
    if (!owner) throw 'GymOwner not found';
    if (ownerParam.email && owner.email !== ownerParam.email) {
        throw 'Email can not be updated';
    }
    if (ownerParam.mobile && owner.mobile !== ownerParam.mobile && await GymOwner.findOne({ mobile: ownerParam.mobile })) {
        throw 'GymOwnername "' + ownerParam.mobile + '" is already taken';
    }

    // hash password if it was entered
    if (ownerParam.password) {
        ownerParam.password = bcrypt.hashSync(ownerParam.password, 10);
    }
    ownerParam.updated = new Date();
    // copy ownerParam properties to owner
    Object.assign(owner, ownerParam);

    await owner.save();
}

async function _delete(id) {
    await GymOwner.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await GymOwner.findById(id);
    // validate
    if (!employee) throw 'GymOwner not found';
    employee.active = 0;
    await employee.save();
}