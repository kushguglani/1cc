const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../server');
const should = chai.should();
const expect = chai.expect;
const Employee = require('../modules/employee/employee.model');
const fs = require('fs')
let token = "";
let userId = ";"

describe("Employee api Test", () => {

    before((done) => { //Before test we empty the database
        if (process.env.NODE_ENV !== 'test') {
            done(`Trying to delete ${process.env.NODE_ENV} data base`);
        } else {
            Employee.deleteMany({}, (err) => {
                done();
            });
        }
    });

    // Test to register an employee
    it("should register an employee", (done) => {
        chai.request(app)
            .post('/employee/register')
            .send({
                name: 'Pickachu',
                userName: 'Picka',
                email: 'picka@gmail.com',
                password: '123456'
            })
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                // expect(res.body.message).to.be.text('Employee Registered sucessfully');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to register an existing employee
    it("should register an existing employee", (done) => {
        chai.request(app)
            .post('/employee/register')
            .send({
                name: 'Pickachu',
                userName: 'Picka',
                email: 'picka@gmail.com',
                password: '123456'
            })
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(400);
                res.body.should.be.a('object');
                // expect(res.body.message).to.be.text('Employee Registered sucessfully');
                expect(res).to.have.status(400);
                done();
            })
    });

    // Test to not register an employee without user name
    it("should not register an employee without user name", (done) => {
        chai.request(app)
            .post('/employee/register')
            .send({
                name: 'Pickachu',
                email: 'picka12@gmail.com',
                password: '123456'
            })
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(500);
                res.body.should.be.a('object');
                // expect(res.body.message).to.be.text('Employee Registered sucessfully');
                expect(res).to.have.status(500);
                done();
            })
    });

    // Test to authenticate an employee
    it("should authenticate an employee", (done) => {
        chai.request(app)
            .post('/employee/authenticate')
            .send({
                userName: 'Picka',
                password: '123456'
            })
            .end((error, res) => {
                should.exist(res.body);
                token = res.body.token;
                userId = res.body.id;
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to authenticate an employee with invalid credentials
    it("should authenticate an employee with invalid credentials", (done) => {
        chai.request(app)
            .post('/employee/authenticate')
            .send({
                userName: 'Picka',
                password: '12345612'
            })
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(401);
                res.body.should.be.a('object');
                expect(res).to.have.status(401);
                done();
            })
    });

    // Test to get list of all employees
    it("should  get list of all employees", (done) => {
        chai.request(app)
            .get('/employee/')
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(1);
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to get list of all employees without token
    it("should  get list of all employees", (done) => {
        chai.request(app)
            .get('/employee/')
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(401);
                res.body.should.be.a('object');
                expect(res).to.have.status(401);
                done();
            })
    });

    // Test to get current employee
    it("should get current employee", (done) => {
        chai.request(app)
            .get('/employee/current')
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to fetch employee by id
    it("should fetch employee by id", (done) => {
        chai.request(app)
            .get('/employee/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to update employee by id
    it("should update employee by id", (done) => {
        chai.request(app)
            .put('/employee/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .send({
                name: 'Pickachu',
                userName: 'Picka',
                email: 'pickachu@gmail.com',
                password: '1234567'
            })
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });


    // Test to upload employee resume
    it("should upload employee resume", (done) => {
        chai.request(app)
            .post('/employee/uploadResume')
            .set('Authorization', 'Bearer ' + token)
            .attach('file', fs.readFileSync('test/file.docx'), 'file.docx')
            .end((error, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });


    // Test to download employee resume
    it("should download employee resume", (done) => {
        chai.request(app)
            .get('/employee/downloadResume/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });


    // Test to delete employee by id
    it("should delete employee by id", (done) => {
        chai.request(app)
            .put('/employee/delete/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to permanently delete employee by id
    it("should permanently delete employee by id", (done) => {
        chai.request(app)
            .delete('/employee/_delete/' + userId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });
});