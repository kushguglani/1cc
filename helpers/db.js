const mongoose = require('mongoose');
console.log(process.env.MONGODB_URI);
console.log(process.env.NODE_ENV);
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI, connectionOptions);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', err => {
    console.log(err);
  });

module.exports = {
    Employee: require('../modules/employee/employee.model'),
    Manager: require('../modules/manager/manager.model'),
    Project: require('../modules/project/project.model'),
};