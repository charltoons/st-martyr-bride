var express, http, path, routes;

express = require('express');

http = require('http');

path = require('path');

routes = require('./routes.js');

exports.init = function() {
  var app;
  app = express();
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express["static"](path.join(__dirname, '../public')));
  if ('development' === app.get('env')) {
    app.use(express.errorHandler());
  }
  app.get('/', routes.index);
  return http.createServer(app).listen(app.get('port'), function() {
    return console.log('St. Martyr Bride running on port ' + app.get('port'));
  });
};
