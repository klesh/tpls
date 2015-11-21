/* Implement Users Management
 * Default mount point: /api/users
 */
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var em = require('emmo-model');

var User = require('../models/user.js');

/* GET users listing. */
router.get('/', em.mount(function(req, res, next) {
  return User.getList(req.query);
}));

/* GET user detail. */
router.get('/:id', em.mount(function(req, res, next) {
  return User.getDetail(req.params.id);
}));

/* INSERT/UPDATE user detail. */
router.post('/', em.mount(function(req, res, next) {
  return User.saveUser(req.user, req.body);
}));

/* DELETE user entry. */
router.delete('/', em.mount(function(req, res, next) {
  return User.deleteUsers(req.user, req.query.ids).thenReturn('SUCCESS');
}));

module.exports = router;
