const expressJwt = require('express-jwt');
const ownerService = require('../modules/gym_owner/gym_owner.service');
const memberService = require('../modules/gym_member/gym_member.service');
const crewService = require('../modules/gym_crew_member/gym_crew.service');

module.exports = jwt;

function jwt() {
    const secret = process.env.SECRET_KEY;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/gym-owner/register',
            '/gym-owner/authenticate',
            '/gym-crew/authenticate',
            '/gym-owner/validate',
            '/gym-member/register',
            '/gym-member/send',
            '/gym-member/validate',
            '/gym-member/authenticate',
            '/documentation'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const owner = await ownerService.getById(payload.id);
    const member = await memberService.getById(payload.id);
    const crew = await crewService.getById(payload.id);
    // revoke token if user no longer exists
    if (!owner && !member && !crew) {
        return done(null, true);
    }
    done();
};