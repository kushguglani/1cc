const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI, connectionOptions);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', err => {
    console.log(err);
  });

module.exports = {
    GymOwner: require('../modules/gym_owner/gym_owner.model'),
    GymMember: require('../modules/gym_member/gym_member.model'),
    GymList: require('../modules/gym_list/gym_list.model'),
    GymCrew: require('../modules/gym_crew_member/gym_crew_member.model'),
    GymPost: require('../modules/gym_post/gym_post.model'),
    GymWorkout:require('../modules/gym_workout_data/workout.model')
    // Manager: require('../modules/manager/manager.model'),
    // Project: require('../modules/project/project.model'),
};