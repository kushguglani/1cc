const express = require('express');
const router = express.Router();
const GymListService = require('./gym_list.service');
const GymOwner = require('../gym_owner/gym_owner.service');
const { storage, fileFilter } = require('../../helpers/fileUploadServer');

const multer = require('multer');
const fs = require('fs');
 
const maxSize = 5 * 1000 * 1000;
// routes
router.post('/authenticate', authenticate);
router.post('/register', validateGymOwner, register);
router.get('/', validateGymOwner, getAll);
router.get('/current', validateEmployee, getCurrent);
router.get('/:id', validateEmployee, getById);
router.put('/:id', validateGymOwner, update);
router.put('/delete/:id', validateEmployee, inactive);
router.delete('/_delete/:id', validateEmployee, _delete);
router.post('/uploadProfile', validateGymOwner, uploadProfile);
router.post('/uploadGymImages', validateGymOwner, uploadGymImages);
router.get('/downloadResume/:id', validateEmployee, downloadResume);

module.exports = router;

function validateGymOwner(req, res, next) {
    req.user.role === 'gymOwner' ? next() : next("Invalid Token")
}
function validateEmployee(req, res, next) {
    req.user.role === 'employee' ? next() : next("Invalid Token")
}

function authenticate(req, res, next) {
    GymListService.authenticate(req.body)
        .then(employee => employee ? res.json(employee) : res.status(401).json({ message: 'User name or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    let gymDetails = {}
    req.body.owner_id=req.user.id;
    GymListService.create(req.body)
        .then((gym) => {
            gymDetails = gym;
            return GymListService.updateGymOwner(req.user.id, gym.id)
        })
        .then(response => {
            return res.json(gymDetails);
        })
        .catch(err => next(err));
    // .then(() => res.json({ "message": "Gym Registered successfully" }))
    // .catch(err => next(err));
}

function getAll(req, res, next) {
    GymListService.getAll()
        .then(gyms => res.json(gyms))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    GymListService.getById(req.user.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymListService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymListService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Gym Details details updated" }))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    GymListService.delete(req.params.id)
        .then(() => res.json({ message: "Employe deleted from db" }))
        .catch(err => next(err));
}

function inactive(req, res, next) {
    GymListService.inactive(req.params.id)
        .then(() => res.json({ message: "Employer Inactive" }))
        .catch(err => next(err));
}

function uploadProfile(req, res, next) {
    const gymId = req.query.id
    const fileUploadPath = `uploads/${gymId}/profile`;
    var filetypes = /jpeg|jpg|png|gif|svg/;
    req.file = {
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
            return res.send({ message: err });
        }
        else if (!req.file) {
            return res.send({ message: 'Please select an file to upload' });
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        GymListService.getById(gymId)
            .then(gym => {
                if (!gym) res.sendStatus(404)
                // check if resume already uploaded
                if (gym.profilePic) {
                    //delete old file from server
                    const path = `${fileUploadPath}/${gym.profilePic}`;
                    try {
                        fs.unlinkSync(path)
                        //file removed
                    } catch (err) {
                        next(err);
                    }
                }
                gym.profilePic = req.file.filename;
                return GymListService.update(gymId, gym)
            })
            .then(() => res.json({ message: "Profile picture uploaded sucessfully!" }))
            .catch(err => next(err));
    });
}

function uploadGymImages(req, res, next) {
    const gymId = req.query.id;
    const fileUploadPath = `uploads/${gymId}/gymImages`;
    var filetypes = /jpeg|jpg|png|gif|svg/;
    req.file = {
        type: "multiple",
        fileUploadPath,
        filetypes
    }

    GymListService.getById(gymId)
        .then(gym => {
            req.file = {
                type: "multiple",
                fileUploadPath,
                filetypes,
            }
            const fileCount= 6 - (gym.gymImages.length >0 ? gym.gymImages.length:0);
            if (!gym) res.sendStatus(404)
            // check count
            else if (gym.gymImages && gym.gymImages.length >= 6) {
                return res.send({ message: "You have already uploaded maximum gym images(6)" })
            }
            else {
                const uploadMultipleFile = multer({
                    storage,
                    limits: { fileSize: maxSize },
                    fileFilter
                }).array("files", fileCount);
                uploadMultipleFile(req, res, function (err) {
                    if (err) {
                        return res.status(404).send({ message: err });
                    }
                    else if (!req.files) {
                        return res.status(404).send({ message: 'Please select an file to upload' });
                    }
                    else if (err instanceof multer.MulterError) {
                        return res.status(404).send(err);
                    }
                    gym.gymImages = [...gym.gymImages, ...req.files.map(curr => curr.filename)];
                    GymListService.update(gymId, gym)
                        .then(() => {
                            res.json({ message: "Gym Images uploaded sucessfully!" })
                        })

                })

            }
        })
}

function downloadResume(req, res, next) {
    const fileLocation = "uploads/cv";
    GymOwner.getById(req.user.id)
        .then(employee => {
            if (employee && employee.resumeUploaded) {
                const filename = employee.resumeUploaded;
                res.download(fileLocation + '/' + filename, filename)
            }
            else res.sendStatus(404)
        })
        .catch(err => next(err));
}
