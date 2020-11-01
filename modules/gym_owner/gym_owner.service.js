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
    sendEmail,
    sendResetEmail,
    getByParam
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
        return { "message": "email verified successfully", status: 1 }
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

async function sendResetEmail(ownerParam, host) {

    const owner = await GymOwner.findById(ownerParam.id);
    let password = Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    ownerParam.password = bcrypt.hashSync(password, 10);
    console.log(owner);
    ownerParam.reset = 1;
    ownerParam.updated = new Date();
    console.log(ownerParam);
    // copy ownerParam properties to owner
    Object.assign(owner, ownerParam);

    await owner.save();
    let mailOptions = {
        to: owner.email,
        subject: `1cc-worl Account Information - ${owner.email} `,
        html: `Hello,<br> We have provided a temporary password i.e <strong>${password}. </strong>`
    }
    return await sendNodeEmail(mailOptions)
}

async function getAll() {
    return await GymOwner.find({ "active": 1 });
}

async function getByParam(param, value) {
    return await GymOwner.find({ [param]: value });
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
        throw 'Owner mobile "' + ownerParam.mobile + '" is already in list';
    }
    
    // if (ownerParam.email && owner.email !== ownerParam.email && await GymOwner.findOne({ email: ownerParam.email })) {
    //     throw 'Owner email "' + ownerParam.email + '" is already taken';
    // }

    // hash password if it was entered
    if (ownerParam.oldPassword || ownerParam.password) {
        if (bcrypt.compareSync(ownerParam.oldPassword, owner.password)) {
            ownerParam.password = bcrypt.hashSync(ownerParam.password, 10);
        }
        else {
            throw 'Current password is incorrect';
        }
    }
    ownerParam.updated = new Date();
    ownerParam.reset = 0;
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