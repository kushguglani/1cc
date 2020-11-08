//node package
const http = require('http');

// 3rd party package
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// for relative path
require('rootpath')();

// In build package
const jwt = require('helpers/jwt');
const errorHandler = require('helpers/error-handler');

//port
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;


setupExpess();
function setupExpess() {
    const app = express();
    const server = http.createServer(app);
    console.log("-------------------");
    app.use(bodyParser.urlencoded({ extended: true }));
    // parses all bodies as a string
    app.use(bodyParser.json());

    // CORS-enabled for all origins!
    app.use(cors());

    // use JWT auth to secure the api
    app.use(jwt());

    // api user routes
    app.use('/gym-owner', require('./modules/gym_owner/gym_owner.controller'));
    app.use('/gym-list', require('./modules/gym_list/gym_list.controller'));
    app.use('/gym-member', require('./modules/gym_member/gym_member.controller'));
    app.use('/gym-crew', require('./modules/gym_crew_member/gym_crew.controller'));
    app.use('/gym-post', require('./modules/gym_post/gym_post.controller'));
    // app.use('/employee', require('./modules/employee/employee.controller'));
    // app.use('/manager', require('./modules/manager/manager.controller'));
    // app.use('/project', require('./modules/project/project.controller'));

    // project documentation in json
    app.get('/documentation', (req, res) => {
        // res.download('documentation/project-seeker.postman_collection.json', 'project-seeker.postman_collection.json');
        res.send({code:"Kush is always khush"})
    })

    // global error handler
    app.use(errorHandler);

    // start server
    server.listen(port, (err) => {
        if (err) return console.log("unable to connect to the server");
        console.log(`Server listening on port ${port}`);
    });
    module.exports = app;
}
