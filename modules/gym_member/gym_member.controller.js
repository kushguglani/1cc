const express = require('express');
const router = express.Router();
const GymMemberService = require('./gym_member.service');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { storage, fileFilter } = require('../../helpers/fileUploadServer');

const maxSize = 50 * 1000 * 1000;
// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/validate', validateEmail);
router.get('/getMemeberByGymId/:id', validateGymCrewOwner, getMemeberByGymId);
// router.get('/send',sendEmail);
// router.get('/', validateMember, getAll);
router.get('/current', validateMember, getCurrent);
router.get('/getById/:id', validateGymCrewOwner, getById);
// router.get('/:id', validateMember, getById);
router.put('/:id', validateMember, update);
router.put('/delete/:id', validateMember, inactive);
router.delete('/_delete/:id', validateMember, _delete);
router.post('/forgotPassword', forgotPassword);
router.post('/uploadProfile', validateMember, uploadProfile);
// router.post('/uploadResume', validateMember, uploadResume)
// router.get('/downloadResume/:id', validateMember, downloadResume)

module.exports = router;

function validateGymOwner(req, res, next) {
    req.user.role === 'gymOwner' ? next() : next("Invalid Token")
}

function validateGymCrewOwner(req, res, next) {
    if (req.user.role === 'gymOwner' || req.user.role === 'crew') next()
    else next("Invalid Token")
}

function validateMember(req, res, next) {
    req.user.role === 'gymMemeber' ? next() : next("Invalid Token")
}

function validateEmail(req, res, next) {
    var id = req.param('id');
    GymMemberService.validateOwnerEmail(id)
        .then(msz => {
            res.json(msz);
        })
}

function authenticate(req, res, next) {
    GymMemberService.authenticate(req.body, req.get('host'))
        .then(owner => owner ? res.json(owner) : res.status(401).json({ message: 'Email or password is incorrect', status: 0 }))
        .catch(err => next(err));
}


function forgotPassword(req, res, next) {
    GymMemberService.getByParam("email", req.body.email)
        .then((owner) => {
            return GymMemberService.sendResetEmail(owner[0], req.get('host'))
        })
        .then(email => {
            if (email.accepted[0])
                res.json({ "message": "Temporary password sent to your registered email", status: 1 })
            else
                res.json({ "error": "error in sending email", status: 0 })
        })
        .catch(err => next(err));
}

function getMemeberByGymId(req, res, next) {
    GymMemberService.getByGymId(req.params.id)
        .then(gymMemebers => gymMemebers ? res.json({ gymMemebers, status: 1 }) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function register(req, res, next) {
    GymMemberService.create(req.body)
        .then((member) => {
            return GymMemberService.sendEmail(member, req.get('host'))
        })
        .then(email => {
            if (email.accepted[0])
                res.json({ "message": "Gym member Registered, please verify your registered email", status: 1 })
            else
                res.json({ "error": "error in sending email", status: 0 })
        })
        .catch(err => next(err));
}

function getAll(req, res, next) {
    GymMemberService.getAll()
        .then(employees => res.json(employees))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    GymMemberService.getById(req.user.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function getById(req, res, next) {
    GymMemberService.getById(req.params.id)
        .then(employee => employee ? res.json(employee) : res.json({ message: "no details found", status: 0 }))
        .catch(err => next(err));
}

function update(req, res, next) {
    GymMemberService.update(req.params.id, req.body)
        .then(() => res.json({ message: "Employee details updated", status: 1 }))
        .catch(err => next(err));
}


function _delete(req, res, next) {
    GymMemberService.delete(req.params.id)
        .then(() => res.json({ message: "Employe deleted from db", status: 1 }))
        .catch(err => next(err));
}

function inactive(req, res, next) {
    GymMemberService.inactive(req.params.id)
        .then(() => res.json({ message: "Employer Inactive" }))
        .catch(err => next(err));
}

function uploadProfile(req, res, next) {
    const memeberID = req.query.id
    const fileUploadPath = `uploads/${memeberID}/profile`;
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
            return res.send({ message: err, status: 0 });
        }
        else if (!req.file) {
            return res.send({ message: 'Please select an file to upload', status: 0 });
        }
        else if (err instanceof multer.MulterError) {
            return res.send({ err, status: 0 });
        }
        else {
            GymMemberService.getById(memeberID)
                .then(gymCrew => {
                    if (!gymCrew) res.json({ message: "no details found", status: 0 })
                    // check if resume already uploaded
                    if (gymCrew.profilePic) {
                        //delete old file from server
                        const path = `${fileUploadPath}/${gymCrew.profilePic}`;
                        try {
                            fs.unlinkSync(path)
                            //file removed
                        } catch (err) {
                            next(err);
                        }
                    }
                    gymCrew.profilePic = req.file.filename;
                    return GymMemberService.update(memeberID, gymCrew)
                })
                .then(() => res.json({ message: "Profile picture uploaded sucessfully!", status: 1 }))
                .catch(err => next(err));
        }
    });
}
function downloadResume(req, res, next) {
    const fileLocation = "uploads/cv";
    GymMemberService.getById(req.user.id)
        .then(employee => {
            if (employee && employee.resumeUploaded) {
                const filename = employee.resumeUploaded;
                res.download(fileLocation + '/' + filename, filename)
            }
            else res.json({ message: "no details found", status: 0 })
        })
        .catch(err => next(err));
}
