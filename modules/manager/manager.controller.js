const express = require('express');
const router = express.Router();
const ManagerService = require('./manager.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', validateManager, getAll);
router.get('/current', validateManager, getCurrent);
router.get('/:id', validateManager, getById);
router.put('/:id', validateManager, update);
router.put('/delete/:id', validateManager, inactive);
router.delete('/_delete/:id', validateManager, _delete);

module.exports = router;

function validateManager(req, res, next) {
    req.user.role === 'manager' ? next():next("Invalid Token")
}

function authenticate(req, res, next) {
    ManagerService.authenticate(req.body)
        .then(manager => manager ? res.json(manager) : res.status(401).json({ message: 'User name or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    ManagerService.create(req.body)
        .then(() => res.json({"message":"Manager Registered"}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    ManagerService.getAll()
        .then(managers => res.json(managers))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    ManagerService.getById(req.user.id)
        .then(manager => manager ? res.json(manager) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    ManagerService.getById(req.params.id)
        .then(manager => manager ? res.json(manager) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    ManagerService.update(req.params.id, req.body)
        .then(() => res.json({message:"Manager details updated"}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    ManagerService.delete(req.params.id)
        .then(() => res.json({message:"Manager deleted from db"}))
        .catch(err => next(err));
}
function inactive(req, res, next) {
    ManagerService.inactive(req.params.id)
        .then(() => res.json({message:"Manager Inactive"}))
        .catch(err => next(err));
}