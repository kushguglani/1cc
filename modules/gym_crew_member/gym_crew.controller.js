const express = require('express');
const router = express.Router();
const GymCrewService = require('./gym_crew.service');
const GymOwner = require('../gym_owner/gym_owner.service');
const { storage, fileFilter } = require('../../helpers/fileUploadServer');

const multer = require('multer');
const fs = require('fs');

const maxSize = 50 * 1000 * 1000;
// routes
router.post('/authenticate', authenticate);
router.post('/register', validateGymOwner, register);
// router.get('/', validateGymOwner, getAll);
router.get('/getByCrew', validateCrewOwner, getByCrew);
router.get('/getByOwner', validateGymOwner, getByOwner);
router.get('/getByGymId', getByGymId);
router.get('/current', validateCrewOwner, getCurrent);
router.get('/:id', validateEmployee, getById);
router.put('/:id', validateCrewOwner, update);
router.put('/delete/:id', validateEmployee, inactive);
router.delete('/_delete/:id', validateEmployee, _delete);
router.post('/uploadProfile', validateCrewOwner, uploadProfile);
router.post('/uploadGymImages', validateGymOwner, uploadGymImages);
router.get('/downloadResume/:id', validateEmployee, downloadResume);

module.exports = router;

function validateGymOwner(req, res, next) {
    req.user.role === 'gymOwner' ? next() : next("Invalid Token")
}

function validateCrewOwner(req, res, next) {
    req.user.role === 'crew' ? next() : next("Invalid Token")
}

function validateEmployee(req, res, next) {
    req.user.role === 'employee' ? next() : next("Invalid Token")
}

function authenticate(req, res, next) {
    GymCrewService.authenticate(req.body)
        .then(employee => employee ? res.json(employee) : res.status(401).json({ message: 'User name or password is incorrect', status: 0 }))
        .catch(err => next(err));
}

function register(req, res, next) {
    let crewDetails = {}
    req.body.owner_id = req.user.id;
    GymCrewService.create(req.body)
        .then((crew) => {
            crewDetails = crew;
            return GymCrewService.updateGymOwner(req.user.id, crew.id)
        })
        .then(response => {
            return res.json(crewDetails);
        })
        .catch(err => next(err));
}

function getAll(req, res, next) {
    GymCrewService.getAll()
        .then(gyms => res.json(gyms))
        .catch(err => next(err));
}

function getByCrew(req, res, next) {
    GymCrewService.getById(req.user.id).then(crew=>{
        GymCrewService.getByOwnerId(crew.owner_id)
        .then(crewMemebers => crewMemebers ? res.json({crewMemebers,status:1}) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
    })
   
}

function getByOwner(req, res, next) {
    GymCrewService.getByOwnerId(req.user.id)
        .then(crewMemebers => crewMemebers ? res.json({crewMemebers,status:1}) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getByGymId(req, res, next) {
    console.log(req.query.id);
    GymCrewService.getByGymId(req.query.id)
        .then(crewMemebers => crewMemebers ? res.json({crewMemebers,status:1}) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    GymCrewService.getById(req.user.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymCrewService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymCrewService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Crew Details updated", status: 1 }))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    GymCrewService.delete(req.params.id)
        .then(() => res.json({ message: "Employe deleted from db" }))
        .catch(err => next(err));
}

function inactive(req, res, next) {
    GymCrewService.inactive(req.params.id)
        .then(() => res.json({ message: "Employer Inactive" }))
        .catch(err => next(err));
}

function uploadProfile(req, res, next) {
    const crewID = req.query.id
    const fileUploadPath = `uploads/${crewID}/profile`;
    var filetypes = /jpeg|jpg|png|gif|svg/;
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
            return res.send({ message: err,  status: 0});
        }
        else if (!req.file) {
            return res.status(404).send({ message: 'Please select an file to upload',  status: 0});
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        GymCrewService.getById(crewID)
            .then(gymCrew => {
                if (!gymCrew) return res.send({ message: "crew id is not valid", status: 0 })
                // check if resume already uploaded
                if (gymCrew.profilePic) {
                    //delete old file from server
                    const path = `${gymCrew.profilePic}`;
                    try {
                        fs.unlinkSync(path)
                        //file removed
                    } catch (err) {
                        next(err);
                    }
                }
                gymCrew.profilePic = fileUploadPath+"/"+req.file.filename;
                return GymCrewService.update(crewID, gymCrew)
            })
            .then(() => res.json({ message: "Profile picture uploaded sucessfully!", status: 1}))
            .catch(err => next(err));
    });
}

function uploadGymImages(req, res, next) {
    const gymId = req.query.id;
    const fileUploadPath = `uploads/${gymId}/gymImages`;
    var filetypes = /jpeg|jpg|png|gif|svg/;
    req.fileDetails = {
        type: "multiple",
        fileUploadPath,
        filetypes
    }

    GymCrewService.getById(gymId)
        .then(gym => {
           
            const fileCount = 6 - (gym.gymImages.length > 0 ? gym.gymImages.length : 0);
            if (!gym) return res.send({ message: "crew id is not valid", status: 0 })
            // check count
            else if (gym.gymImages && gym.gymImages.length >= 6) {
                return res.send({ message: "You have already uploaded maximum gym images(6)", status: 0 })
            }
            else {
                const uploadMultipleFile = multer({
                    storage,
                    limits: { fileSize: maxSize },
                    fileFilter
                }).array("files", fileCount);
                uploadMultipleFile(req, res, function (err) {
                    if (err) {
                        return res.status(404).send({ message: err , status: 1 });
                    }
                    else if (!req.files) {
                        return res.status(404).send({ message: 'Please select an file to upload' , status: 0});
                    }
                    else if (err instanceof multer.MulterError) {
                        return res.status(404).send(err);
                    }
                    gym.gymImages = [...gym.gymImages, ...req.files.map(curr => fileUploadPath+"/"+curr.filename)];
                    GymCrewService.update(gymId, gym)
                        .then(() => {
                            res.json({ message: "Gym Images uploaded sucessfully!" , status: 1 })
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
            else res.json({ message: "no details found", status: 0 })
        })
        .catch(err => next(err));
}
