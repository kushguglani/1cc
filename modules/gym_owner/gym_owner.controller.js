const express = require('express');
const router = express.Router();
const GymOwnerService = require('./gym_owner.service');
const Upload = require('../../helpers/fileUploadServer');
const multer = require('multer');
const fs = require('fs');

// routes
router.post('/authenticate', authenticate);
router.get('/validate', validateEmail);
router.post('/forgotPassword', forgotPassword);
router.get('/validate', validateEmail);
router.post('/register', register);
// router.get('/', validateGymOwner, getAll);
router.get('/current', validateGymOwner, getCurrent);
// router.get('/:id', validateGymOwner, getById);
router.put('/:id', validateGymOwner, update);
router.put('/delete/:id', validateGymOwner, inactive);
router.delete('/_delete/:id', validateGymOwner, _delete);
// router.post('/uploadResume', validateGymOwner, uploadResume)
// router.get('/downloadResume/:id', validateGymOwner, downloadResume)

module.exports = router;


function validateGymOwner(req, res, next) {
    req.user.role === 'gymOwner' ? next() : next("Invalid Token")
}

function validateEmail(req, res, next) {
    var id = req.param('id');
    GymOwnerService.validateOwnerEmail(id)
        .then(msz => {
            res.json(msz);
        })
}

function authenticate(req, res, next) {
    console.log("authenticate--------------");
    console.log(req.body);
    GymOwnerService.authenticate(req.body)
        .then(owner => owner ? res.json(owner) : res.status(401).json({ message: 'Email or password is incorrect', status: 0 }))
        .catch(err => next(err));
}

function register(req, res, next) {
    GymOwnerService.create(req.body)
        .then((owner) => {
            return GymOwnerService.sendEmail(owner, req.get('host'))
        })
        .then(email => {
            if (email.accepted[0])
                res.json({ "message": "Gym owner Registered, please verify your registered email", status: 1 })
            else
                res.json({ "error": "error in sending email", status: 0 })
        })
        .catch(err => next(err));
}

function forgotPassword(req, res, next) {
    GymOwnerService.getByParam("email", req.body.email)
        .then((owner) => {
            return GymOwnerService.sendResetEmail(owner[0], req.get('host'))
        })
        .then(email => {
            if (email.accepted[0])
                res.json({ "message": "Temporary password sent to your registered email", status: 1 })
            else
                res.json({ "error": "error in sending email", status: 0 })
        })
        .catch(err => next(err));
}

function getAll(req, res, next) {
    GymOwnerService.getAll()
        .then(employees => res.json(employees))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    GymOwnerService.getById(req.user.id)
        .then(owner => owner ? res.json(owner) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymOwnerService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymOwnerService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Employee details updated", status: 1 }))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    GymOwnerService.delete(req.params.id)
        .then(() => res.json({ message: "Employe deleted from db" }))
        .catch(err => next(err));
}

function inactive(req, res, next) {
    GymOwnerService.inactive(req.params.id)
        .then(() => res.json({ message: "Employer Inactive" }))
        .catch(err => next(err));
}

function uploadResume(req, res, next) {
    Upload.Upload(req, res, function (err) {
        if (err) {
            return res.send({ message: err });
        }
        else if (!req.file) {
            return res.send({ message: 'Please select an file to upload' });
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        GymOwnerService.getById(req.user.id)
            .then(employee => {
                if (!employee) res.sendStatus(404)
                // check if resume already uploaded
                if (employee.resumeUploaded) {
                    //delete old file from server
                    const path = './uploads/cv/' + employee.resumeUploaded;
                    try {
                        fs.unlinkSync(path)
                        //file removed
                    } catch (err) {
                        next(err);
                    }
                }
                employee.resumeUploaded = req.file.filename;
                return GymOwnerService.update(req.user.id, employee)
            })
            .then(() => res.json({ message: "File uploaded sucessfully!" }))
            .catch(err => next(err));
    });
}

function downloadResume(req, res, next) {
    const fileLocation = "uploads/cv";
    GymOwnerService.getById(req.user.id)
        .then(employee => {
            if (employee && employee.resumeUploaded) {
                const filename = employee.resumeUploaded;
                res.download(fileLocation + '/' + filename, filename)
            }
            else res.sendStatus(404)
        })
        .catch(err => next(err));
}
