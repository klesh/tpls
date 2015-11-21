/* Implement User Login logic
 * Default mount potin: /login
 */
var express = require('express');
var router = express.Router();

var kaptcha = require('kaptcha');
var em = require('emmo-model');
var _ = require('lodash');

var Captcha = require('../models/captcha.js');
var User = require('../models/user.js');
var config = require('../config.json');

// generate a random captcha key for client to request captcha image.
router.get('/captcha', em.mount(function(req, res) {
  return Captcha.create();
}));

// generate captcah image base on given captchaKey, and store into database.
router.get('/captcha/:captchaKey', function(req, res) {
  Captcha.generateCode(req.params.captchaKey).then(function(code) {
    kaptcha.generateImage(req, res, { width: 100, height: 30, text: code });
  });
});

// validate captcha code and then account/password, response requested body and token if success.
router.post('/authenticate', em.mount(function(req, res) {
  return Captcha.validateCode(req.body.captchaKey, req.body.captchaCode).then(function() {
    return User.authenticate(req.body.account, req.body.password);
  });
}));

module.exports = router;
