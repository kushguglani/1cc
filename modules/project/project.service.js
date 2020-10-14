const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('helpers/db');
const Project = db.Project;

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    getAllOpenings,
    apply,
    inactive
};

async function apply(id, userID ) {
    const project = await Project.findById(id);
    if (!project) throw 'Project not found';
    // copy projectParam properties to project
    if(project.userApplied.indexOf(userID) === -1){
        project.userApplied = [...project.userApplied,userID]
        await project.save();
    } else{
        throw 'Already applied to this project';
    }
  
}

async function getAll() {
    return await Project.find({"active":1});
}

async function getAllOpenings() {
    return await Project.find({ "status": "open" });
}

async function getById(id) {
    return await Project.findById(id);
}

async function create(projectParam) {
    // validate
    // if (await Project.findOne({ email: projectParam.email })) {
    //     throw `Project with email:${projectParam.email} already exists`;
    // }

    const project = new Project(projectParam);

    // // hash password
    // if (projectParam.password) {
    //     project.password = bcrypt.hashSync(projectParam.password, 10);
    // }
    // save project
    await project.save();
}

async function update(id, projectParam) {
    const project = await Project.findById(id);

    // copy projectParam properties to project
    Object.assign(project, projectParam);

    await project.save();
}

async function _delete(id) {
    await Project.findByIdAndRemove(id);
}


async function inactive(id) {
    const project = await Project.findById(id);
    // validate
    if (!project) throw 'Project not found';
    project.active = 0;
    await project.save();
}