const express = require('express');
const { create } = require('./workout.model');
const router = express.Router();
const WorkoutService = require('./workout.service')

router.post('/create', createWorkout);
router.get('/getExercise', getExercise);
router.get('/mockUserWorkOut', mockUserWorkOut);

function createWorkout(req, res, next) {
    WorkoutService.create(req.body)
        .then(workout => {
            return res.json(workout);
        })
        .catch(err => next(err));
}

function getExercise(eq, res, next) {
    WorkoutService.getExercise()
        .then(workout => {
            return res.json(workout);
        })
        .catch(err => next(err));
}
function mockUserWorkOut(eq, res, next) {
    let workData = [{
        "member_id": "123",
        "name": "workout_1",
        "days": [
            1,
            2,
            3,
            4,
            5
        ],
        "exercises": {
            "warmUp": {
                "name": "warmup",
                "sets": [
                    "5min"
                ],
                "restAfterExercise": "5min"
            },
            "cardio": [
                {
                    "type": "all",
                    "name": "Tredmill",
                    "sets": [
                        "15min",
                        "5min",
                        "5min"
                    ],
                    "restBetweenSets": "1min",
                    "restAfterExercise": "5min"
                },
                {
                    "type": "all",
                    "name": "Bicycle Machine",
                    "sets": [
                        "5min",
                        "5min",
                        "5min"
                    ],
                    "restBetweenSets": "1min",
                    "restAfterExercise": "5min"
                }
            ],
            "weightLifting": [
                {
                    "type": "chest",
                    "name": "Bench Press",
                    "sets": [
                        {
                            "weight": "5kg",
                            "repos": 5
                        },
                        {
                            "weight": "5kg",
                            "repos": 5
                        },
                        {
                            "weight": "5kg",
                            "repos": 5
                        }
                    ],
                    "restBetweenSets": "1min",
                    "restAfterExercise": "5min"
                }
            ],
            "calisthencis": [
                {
                    "type": "all",
                    "name": "Tredmill",
                    "sets": [
                        "5min",
                        "5min",
                        "5min"
                    ],
                    "restBetweenSets": "1min",
                    "restAfterExercise": "5min"
                }
            ]
        },
        "created": "",
        "updated": ""
    }]
    return res.json(workData);
}

module.exports = router;