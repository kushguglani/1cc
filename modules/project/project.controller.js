const express = require('express');
const router = express.Router();
const projectService = require('./project.service');

// routes
router.post('/register', validateManager, register);
router.put('/apply/:id',validateEmployee, apply);
router.get('/',validateManager, getAll);
router.get('/opening', getAllOpenings);
router.get('/:id',validateManager, getById);
router.put('/:id', validateManager, update);
router.put('/delete/:id', validateManager, inactive);
router.delete('/_delete/:id', validateManager, _delete);

module.exports = router;

function validateEmployee(req, res, next) {
    req.user.role === 'employee' ? next():next("Invalid Token")
}

function validateManager(req, res, next) {
    req.user.role === 'manager' ? next():next("Invalid Token")
}

function apply(req, res, next) {
    projectService.apply(req.params.id,req.user.id)
        .then(() => res.json({message:'applied'}))
        .catch(err => next(err));
}

function getAllOpenings(req, res, next) {
    projectService.getAllOpenings()
        .then(projects => res.json(projects))
        .catch(err => next(err));
}

function register(req, res, next) {
    projectService.create(req.body)
        .then(() => res.json({ "message": "Project Added" }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    projectService.getAll()
        .then(projects => res.json(projects))
        .catch(err => next(err));
}

function getById(req, res, next) {
    projectService.getById(req.params.id)
        .then(project => project ? res.json(project) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    projectService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    projectService.delete(req.params.id)
        .then(() => res.json({message:"Project deleted from db"}))
        .catch(err => next(err));
}



function inactive(req, res, next) {
    projectService.inactive(req.params.id)
        .then(() => res.json({message:"Project Inactive"}))
        .catch(err => next(err));
}