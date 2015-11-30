var em = require('emmo-model');
var crypto = require('crypto');
var moment = require('moment');
var config = require('../config.json');
var _ = require('lodash');
var Promise2 = require('bluebird');
var jwt = require('jsonwebtoken');

var User = module.exports = em.define('User', {
  id: { type: 'int', autoIncrement: true, primaryKey: true },
  account: { type: 'string', length: 20, allowNull: false, unique: true },
  passwordHash: { type: 'string', length: 40 },
  name: { type: 'string', length: 50 },
  logonAt: { type: 'timestamptz' },
  tokenHash: { type: 'string' },
  root: { type: 'boolean' },
  disabled: { type: 'boolean' },
  createdAt: { type: 'timestamptz', defaultValue: 'now()' },
  updatedAt: { type: 'timestamptz' }
});

// insert default admin into database when created.
em.initialize(function() {
  return User.insert({
    account: 'admin',
    passwordHash: User.digestPassword('info123'),
    root: true
  });
});

// hash password
User.digestPassword = function(password) {
  return crypto.createHmac('sha1', config.secret).update(password).digest('hex');
};

// token hash, any field change cause token expiration.
User.digestToken = function(user) {
  var text = [
    user.id, 
    user.passwordHash,
    !!user.root, 
    !!user.disabled, 
    user.logonAt.valueOf() // remove this to allow multiple login
  ].join('-');
  var hash = crypto.createHmac('sha1', config.secret).update(text).digest('hex');
  return hash;
};

// authenticate login info
User.authenticate = function(account, password) {
  return em.scope(function(db) {
    return db.selectOne('User', { 
      field: [ 'id', 'passwordHash', 'root', 'account', 'disabled' ], 
      where: { account: account } 
    }).then(function(user) {
      if (!user) 
        return Promise2.reject({ code: 'InvalidUser', description: '用户不存在' });
      if (user.passwordHash != User.digestPassword(password))
        return Promise2.reject({ code: 'InvalidPassword', description: '密码不正确' });
      if (user.disabled)
        return Promise2.reject({ code: 'UserDiabled', description: '帐号已被禁用' });

      var payload = _.pick(user, 'id', 'root', 'account');
      payload.logonAt = user.logonAt = moment();
      payload.tokenHash = User.digestToken(user);
      payload.token = jwt.sign(payload, config.secret);
      return db.update('User', _.pick(payload, 'id', 'logonAt', 'tokenHash')).then(function() { 
        return payload; 
      });
    });
  });
};

// enforce token expiration when user is updated or login in anthor machine.
User.tokenRevoked = function(req, payload, done) {
  return User.scalar({ 
    field: em.count(), 
    where: { 
      id: payload.id, // ensure user exists in system.
      tokenHash: payload.tokenHash
    }
  }).then(function(count) {
    done(null, count * 1 !== 1);
  }).error(done);
};

User.getList = function(params) {
  var options = { field: [ 'id', 'account', 'createdAt', 'logonAt' ], order: { id: 'DESC' }, limit: 50 };

  if (params) {
    options.where = {};

    if (params.lastId)
      options.where.id = [ '<', params.lastId ];

    if (params.account)
      options.where.account = params.account;
  }

  return User.select(options);
};

User.getDetail = function(id) {
  return User.find(id).then(function(user) {
    return _.omit(user, 'passwordHash', 'tokenHash');
  });
};

User.saveUser = function(operator, userDetail) {
  if (!operator.root && userDetail.id != operator.id)
    return Promise2.reject({ code: 'EPERM', description: '无权操作' });

  userDetail = _.omit(userDetail, 'createdAt', 'updatedAt', 'logonAt', 'tokenHash');

  // password
  if (userDetail.password) {
    userDetail.passwordHash = User.digestPassword(userDetail.password);
  } else if (userDetail.hasOwnProperty('passwordHash')) {
    delete userDetail.passwordHash;
  }

  // do not accept account changing for updating
  if (userDetail.id) {
    if (userDetail.hasOwnProperty('account'))
      delete userDetail.account;
    
    userDetail.updatedAt = moment();
  }

  return User.save(userDetail).tap(function() {
    if (userDetail.updatedAt) { // update token hash if needed
      return User.find(userDetail.id).then(function(user) {
        var oldTokenHash = user.tokenHash;
        var newTokenHash = User.digestToken(user);
        if (oldTokenHash !== newTokenHash) {
          return User.update({ id: user.id, tokenHash: newTokenHash });
        }
      });
    }
  }).then(function(user) { 
    return _.pick(user, 'id'); 
  }).error(function(err) {
    if (err.message.indexOf('duplicate key') >= 0)
      return Promise.reject({ code: 'EDUPLICATED', description: '帐号已存在' });
    throw err;
  });
};

User.deleteUsers = function(operator, ids) {
  if (!operator.root)
    return Promise2.reject({ code: 'EPERM', description: '无权操作' });
  
  ids = _.isArray(ids) ? ids : [ ids ];
  //console.log(ids);
  return User.scalar({ field: em.count(), where: { root: true, id: ['not in', ids] } }).then(function(rootLeft) {
    //console.log(rootLeft, rootLeft < 1);
    if (rootLeft < 1)
      return Promise2.reject({ code: 'EROOT', description: '不能删除所有超级管理员' });

    return User.delete({ id: ['in', ids] });
  });

};
