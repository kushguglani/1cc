const express = require('express');
const router = express.Router();
const GymOwnerService = require('./gym_owner.service');
const Upload = require('../../helpers/fileUploadServer');
const multer = require('multer');
const fs = require('fs');

// routes
router.post('/authenticate', authenticate);
router.get('/validate', validateEmail);
router.post('/register', register);
router.get('/', validateEmployee, getAll);
router.get('/current', validateEmployee, getCurrent);
router.get('/:id', validateEmployee, getById);
router.put('/:id', validateEmployee, update);
router.put('/delete/:id', validateEmployee, inactive);
router.delete('/_delete/:id', validateEmployee, _delete);
router.post('/uploadResume', validateEmployee, uploadResume)
router.get('/downloadResume/:id', validateEmployee, downloadResume)

module.exports = router;

function validateEmployee(req, res, next) {
    req.user.role === 'employee' ? next() : next("Invalid Token")
}

function validateEmail(req, res, next) {
    var id = req.param('id');
    GymOwnerService.validateOwnerEmail(id)
    .then(msz=>{
        res.json(msz);
    })
}

function authenticate(req, res, next) {
    GymOwnerService.authenticate(req.body)
        .then(owner => owner ? res.json(owner) : res.status(401).json({ message: 'Email or password is incorrect' }))
        .catch(err => next(err));
}

function emailAuthenticate(req, res, next) {
    GymOwnerService.authenticate(req.body)
        .then(employee => employee ? res.json(employee) : res.status(401).json({ message: 'User name or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    GymOwnerService.create(req.body)
    .then((owner) => {
        return GymOwnerService.sendEmail(owner, req.get('host'))
    })
    .then(email => {
        if (email.accepted[0])
            res.json({ "message": "Gym owner Registered, please verify your registered email" })
        else
            res.json({ "error": "error in sending email" })
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
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymOwnerService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymOwnerService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Employee details updated" }))
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
                res.download(fileLocation+'/'+filename, filename)
            }
            else res.sendStatus(404)
        })
        .catch(err => next(err));
}
