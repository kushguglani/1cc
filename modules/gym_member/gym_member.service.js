const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const sendNodeEmail = require('../../helpers/mailerService');
const GymMember = db.GymMember;
const GymList = db.GymList;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    inactive,
    sendEmail,
    getByParam,
    sendResetEmail,
    validateOwnerEmail,
    getByGymId
};

async function authenticate({ email, password }) {
    const owner = await GymMember.findOne({ email });
    if (!owner) return
    if (owner.active === 0) return { message: "Owner is inactive", status: 0 }
    if (owner.emailVerirfied === 0) return { message: "Email Verification Pending", status: 0 }
    else if (owner && bcrypt.compareSync(password, owner.password)) {
        const payload = { id: owner.id, role: 'gymMemeber' };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });

        return {
            ...owner.toJSON(),
            token
        };
    }
}
async function sendEmail(member, host) {
    const payload = { id: member.id, role: 'gymMemeber' };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
    let link = "http://" + host + "/gym-member/validate?id=" + token;
    let mailOptions = {
        to: member.email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    }
    return await sendNodeEmail(mailOptions)
}

async function validateOwnerEmail(jwtID) {
    var decoded = jwt.verify(jwtID, process.env.SECRET_KEY)
    if (decoded.role !== "gymMemeber") return "Gym Member is not valid";
    let id = decoded.id;
    const owner = await GymMember.findOne({ "_id": id });
    if (owner) {
        owner.emailVerirfied = 1;
        await owner.save();
        return { "message": "email verified successfully", status: 1 }
    }
}

async function getAll() {
    return await GymMember.find({ "active": 1 });
}

async function getById(id) {
    return await GymMember.findById(id);
}


async function sendResetEmail(ownerParam, host) {

    const owner = await GymMember.findById(ownerParam.id);
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

async function getByParam(param, value) {
    return await GymMember.find({ [param]: value });
}

async function getByGymId(id) {
    return await GymMember.find({ "connected_gym": id });
}

async function create(employeeParam) {
    // validate
    if (await GymMember.findOne({ email: employeeParam.email })) {
        throw `GymMember with email:${employeeParam.email} already exists`;
    }
    else if (await GymMember.findOne({ mobile: employeeParam.mobile })) {
        throw `GymMember with mobile :${employeeParam.mobile} already exists`;
    }

    const member = new GymMember(employeeParam);

    // hash password
    if (employeeParam.password) {
        member.password = bcrypt.hashSync(employeeParam.password, 10);
    }
    // save employee
    return await member.save();
}

async function update(id, employeeParam) {
    const employee = await GymMember.findById(id);

    // validate
    if (!employee) throw 'GymMember not found';
    if (employee.employeename !== employeeParam.employeename && await GymMember.findOne({ employeename: employeeParam.employeename })) {
        throw 'GymMembername "' + employeeParam.employeename + '" is already taken';
    }
    if (employeeParam.connected_gym) {
        // add to gym list recent_gym_member 
        const gym = await GymList.findById(employeeParam.connected_gym);
        // validate
        if (!gym) throw 'Gym Id not found';
        gym.recent_gym_member = id;
        await gym.save();
    }

    // hash password if it was entered
    if (employeeParam.password) {
        employeeParam.hash = bcrypt.hashSync(employeeParam.password, 10);
    }
    employeeParam.updated = new Date();
    // copy employeeParam properties to employee
    Object.assign(employee, employeeParam);

    await employee.save();
}

async function _delete(id) {
    await GymMember.findByIdAndRemove(id);
}

async function inactive(id) {
    const employee = await GymMember.findById(id);
    // validate
    if (!employee) throw 'GymMember not found';
    employee.active = 0;
    await employee.save();
}