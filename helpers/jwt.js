const expressJwt = require('express-jwt');
// const userService = require('modules/employee/employee.service');
// const managerService = require('modules/manager/manager.service');

module.exports = jwt;

function jwt() {
    const secret = process.env.SECRET_KEY;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/employee/authenticate',
            '/gym-owner/register',
            '/gym-owner/authenticate',
            '/gym-member/register',
            '/gym-member/send',
            '/gym-member/validate',
            '/gym-member/authenticate',
            '/manager/authenticate',
            '/manager/register',
            '/auth/facebook',
            '/documentation'
        ]
    });
}

async function isRevoked(req, payload, done) {
    // const user = await userService.getById(payload.id);
    // const manager = await managerService.getById(payload.id);
    // revoke token if user no longer exists
    // if (!user && !manager) {
    //     return done(null, true);
    // }
    done();
};