const express = require('express');
const { create } = require('./workout.model');
const router = express.Router();
const WorkoutService = require('./workout.service')

router.post('/create', createWorkout);
router.get('/getWorkout', getWorkout);

function createWorkout(req, res, next) {
    WorkoutService.create(req.body)
        .then(workout => {
            return res.json(workout);
        })
        .catch(err => next(err));
}

function getWorkout(eq, res, next) {
    WorkoutService.getWorkout()
    .then(workout => {
        console.log(workout);
        return res.json(workout);
    })
    .catch(err => next(err));
}

module.exports = router;