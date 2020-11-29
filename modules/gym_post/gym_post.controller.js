const express = require('express');
const router = express.Router();
const GymPostService = require('./gym_post.service');
const GymOwner = require('../gym_owner/gym_owner.service');
const { storage, fileFilter } = require('../../helpers/fileUploadServer');
var mongoose = require('mongoose');

const multer = require('multer');
const fs = require('fs');

const maxSize = 50 * 1000 * 1000;
// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', validateEmployee, getCurrent);
router.get('/getByUser', getByCurrent);
router.get('/getByDate', getByDate);
router.get('/:id', validateEmployee, getById);
router.put('/:id', validateGymOwner, update);
router.put('/delete/:id', validateEmployee, inactive);
router.delete('/_delete/:id', validateEmployee, _delete);
// router.post('/uploadProfile', validateGymOwner, uploadProfile);
router.post('/uploadVideo', uploadVideo);
router.get('/downloadResume/:id', validateEmployee, downloadResume);

module.exports = router;

function validateGymOwner(req, res, next) {
    req.user.role === 'gymOwner' ? next() : next("Invalid Token")
}
function validateEmployee(req, res, next) {
    req.user.role === 'employee' ? next() : next("Invalid Token")
}

function authenticate(req, res, next) {
    GymPostService.authenticate(req.body)
        .then(employee => employee ? res.json(employee) : res.status(401).json({ message: 'User name or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    let gymPosts = {}
    req.body.owner_id = req.user.id;
    GymPostService.create(req.body)
        .then((gym) => {
            gymPosts = gym;

            return res.json(gymPosts);
        })
        .catch(err => next(err));
    // .then(() => res.json({ "message": "Gym Registered successfully" }))
    // .catch(err => next(err));
}

function getAll(req, res, next) {
    GymPostService.getAll()
        .then(posts => {
            // res.json(posts);
            const postData = [];
            posts.forEach((curr, i) => {
                if (curr.gym_id && mongoose.Types.ObjectId.isValid(curr.gym_id)) {
                    console.log("------" + curr.gym_id);
                    //fetch gym by id
                     GymPostService.getGymById(curr.gym_id)
                        .then(gym => {
                            curr['gymData'] = gym[0];
                            console.log("curr");
                            console.log(curr);
                            postData.push(curr)
                            if (i === posts.length - 1) {
                                return res.json(postData);
                            }
                        })
                } else {
                    postData.push(curr)
                }

            })
            console.log("check");
        })
        .catch(err => next(err));
}

function getByCurrent(req, res, next) {
    GymPostService.getByParam("owner_id", req.user.id)
        .then(gym => gym ? res.json(gym) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getByDate(req, res, next) {
    GymPostService.getByDate()
        .then(gym => gym ? res.json(gym) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    GymPostService.getById(req.user.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymPostService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymPostService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Gym Details updated" }))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    GymPostService.delete(req.params.id)
        .then(() => res.json({ message: "Employe deleted from db" }))
        .catch(err => next(err));
}

function inactive(req, res, next) {
    GymPostService.inactive(req.params.id)
        .then(() => res.json({ message: "Employer Inactive" }))
        .catch(err => next(err));
}

function uploadVideo(req, res, next) {
    const postId = req.query.id
    const fileUploadPath = `uploads/${req.user.id}/post`;
    var filetypes = /mp4|mov|webm|mkv|gif|3gp/;
    req.fileDetails = {
        type: "single",
        fileUploadPath,
        filetypes
    }
    const UploadSingle = multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter
    }).single("file");
    UploadSingle(req, res, function (err) {
        if (err) {
            return res.send({ message: err, status: 0 });
        }
        else if (!req.file) {
            return res.send({ message: 'Please select an file to upload', status: 0 });
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        GymPostService.getById(postId)
            .then(gym => {
                if (!gym) res.json({ message: "no details found", status: 0 })
                // check if resume already uploaded
                if (gym.postMediaName) {
                    //delete old file from server
                    const path = `${gym.postMediaName}`;
                    try {
                        fs.unlinkSync(path)
                        //file removed
                    } catch (err) {
                        next(err);
                    }
                }
                gym.postMediaName = fileUploadPath + "/" + req.file.filename;
                return GymPostService.update(postId, gym)
            })
            .then(() => res.json({ message: "Post video uploaded sucessfully!", status: 1 }))
            .catch(err => next(err));
    });
}


function downloadResume(req, res, next) {
    const fileLocation = "uploads/cv";
    GymOwner.getById(req.user.id)
        .then(employee => {
            if (employee && employee.resumeUploaded) {
                const filename = employee.resumeUploaded;
                res.download(fileLocation + '/' + filename, filename)
            }
            else res.json({ message: "no details found", status: 0 })
        })
        .catch(err => next(err));
}
