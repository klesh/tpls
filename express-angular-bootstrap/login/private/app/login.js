var ejwt = require('express-jwt');
var config = require('../../config.json');
var login = require('../../routes/login.js');
var users = require('../../routes/users.js');
var User = require('../../models/user.js');

// inject login module and users module
module.exports = function(app) {
  app.use('/login', login);

  app.use('/api', ejwt({ secret: config.secret, isRevoked: User.tokenRevoked }));
  app.use('/api/users', users);
};
