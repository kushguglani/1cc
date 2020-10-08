const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../server');
const should = chai.should();
const expect = chai.expect;
const Manager = require('../modules/manager/manager.model');
let token = "";
let managerId = ";"

describe("Manager api Test", () => {

    before((done) => { //Before test we empty the database
        if (process.env.NODE_ENV !== 'test') {
            done(`Trying to delete ${process.env.NODE_ENV} data base`);
        } else {
            Manager.deleteMany({}, (err) => {
                done();
            });
        }
    });

    // Test to register an manager
    it("should register an manager", (done) => {
        chai.request(app)
            .post('/manager/register')
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
                // expect(res.body.message).to.be.text('Manager Registered sucessfully');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to authenticate an manager
    it("should authenticate an manager", (done) => {
        chai.request(app)
            .post('/manager/authenticate')
            .send({
                userName: 'Picka',
                password: '123456'
            })
            .end((error, res) => {
                should.exist(res.body);
                token = res.body.token;
                managerId = res.body.id;
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to get list of all managers
    it("should  get list of all managers", (done) => {
        chai.request(app)
            .get('/manager/')
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

    // Test to get current manager
    it("should get current manager", (done) => {
        chai.request(app)
            .get('/manager/current')
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to fetch manager by id
    it("should fetch manager by id", (done) => {
        chai.request(app)
            .get('/manager/'+managerId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to update manager by id
    it("should update manager by id", (done) => {
        chai.request(app)
            .put('/manager/'+managerId)
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
    
    // Test to delete manager by id
    it("should delete manager by id", (done) => {
        chai.request(app)
            .put('/manager/delete/'+managerId)
            .set('Authorization', 'Bearer ' + token)
            .end((error, res) => {
                should.exist(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test to permanently delete manager by id
    it("should permanently delete manager by id", (done) => {
        chai.request(app)
            .delete('/manager/_delete/'+managerId)
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