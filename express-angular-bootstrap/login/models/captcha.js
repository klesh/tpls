var em = require('emmo-model');
var moment = require('moment');
var kaptcha = require('kaptcha');

var Captcha = em.define('Captcha', {
  captchaKey: { type: 'string', length: 20, primaryKey: true, unique: true, allowNull: false },
  captchaCode: { type: 'string', length: 6 },
  expiredAt: { type: 'timestamptz', allowNull: false }
});

function clearExpired() {
  em.scope(db => db.delete('Captcha', { expiredAt: [ '<', moment() ] }));
}

function create() {
  var captcha = {
    captchaKey: Math.random().toString().split('.')[1],
    expiredAt: moment().add(10, 'm')
  };
  return em.scope(db => db.insert('Captcha', captcha).thenReturn(captcha));
}

function generateCode(captchaKey) {
  var captcha = new Captcha({ captchaKey });

  return captcha.validate(true).then(function() {
    captcha.captchaCode = kaptcha.generateCode();
    return em.scope(function(db) {
      return db.update('Captcha', 
        { captchaCode: captcha.captchaCode }, 
        { expiredAt: [ '>', moment() ], captchaCode: null, captchaKey });
    }).then(function(affectedRow) {
      if (affectedRow === 1)
        return captcha.captchaCode;
      return Promise.reject({ code: 'InvalidCaptchaKey', description: '无效的验码编号' });
    });
  });
}

function validateCode(captchaKey, captchaCode) {
  return em.scope(function(db) {
    return db.delete('Captcha', { 
      captchaKey, 
      captchaCode, 
      expiredAt: [ '>', moment() ]
    });
  }).then(function(affectedRows) {
    if (affectedRows !== 1)
      return Promise.reject({ code: 'InvalidCaptcha', description: '无效的验证码' });
  });
}

Captcha.create = create;
Captcha.generateCode = generateCode;
Captcha.validateCode = validateCode;
setInterval(clearExpired, 60 * 60 * 1000);

module.exports = Captcha;
