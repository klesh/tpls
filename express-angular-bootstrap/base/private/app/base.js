var express = require('express');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

// set up app for development(debug)
// replace app.use(express.static(...)) with require('')
module.exports = function(app) {
  require('emmo-model').sync();

  if (app.get('env') !== 'development')
    return;

  // intecept app client side js requests, to render original js files for easier debugging
  app.get('/js/all.js', function(req, res) {
    fs.readdir('./private/js', function(err, files) {
      var scripts = _.filter(files, f => _.endsWith(f, '.js')).map(function(js) {
        return 'document.write("<script src=\'/js/' + js + '\'></scr" + "ipt>");';
      });
      scripts.push(fs.readFileSync('./node_modules/faker/build/build/faker.min.js').toString());
      //scripts.push('faker.locale = "zh_CN";');
      res.end(scripts.join('\n'));
    });
  });
  app.use('/timeout/:seconds',function(req, res, next) {
    setTimeout(function() {
      res.end(req.params.seconds + ' seconds is up');
    }, req.params.seconds * 1000);
  });

  app.use('/redirect/:to', function(req, res, next) {
    res.redirect('http://' + req.params.to);
  });

  // static resources suppose to be served by nginx some kind.
  app.use(express.static(path.join(__dirname, '../../public')));
  // allow client side to request original client side js sources.
  app.use(express.static(path.join(__dirname, '../../private')));
};
