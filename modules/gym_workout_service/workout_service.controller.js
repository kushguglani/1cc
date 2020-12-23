const express = require('express');
const { create } = require('./workout_service.model');
const router = express.Router();
const WorkoutService = require('./workout_service.service')

router.post('/create', validateMember, createWorkout);
router.get('/getWorkout', validateMember, getWorkout);


function validateMember(req, res, next) {
    req.user.role === 'gymMemeber' ? next() : next("Invalid Token")
}

function createWorkout(req, res, next) {
    WorkoutService.create(req.body)
        .then(workout => {
            return res.json(workout);
        })
        .catch(err => next(err));
}

function getWorkout(req, res, next) {
    WorkoutService.getByParam("member_id", req.user.id)
        .then(workout => {
            console.log(workout);
            return res.json(workout);
        })
        .catch(err => next(err));
}

module.exports = router;