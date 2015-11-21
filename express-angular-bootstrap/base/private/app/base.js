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
      res.end(scripts.join('\n'));
    });
  });

  // static resources suppose to be served by nginx some kind.
  app.use(express.static(path.join(__dirname, '../../public')));
  // allow client side to request original client side js sources.
  app.use(express.static(path.join(__dirname, '../../private')));
};
