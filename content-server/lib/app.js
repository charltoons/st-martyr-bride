var express, http, path, routes, twitter;

express = require('express');

http = require('http');

path = require('path');

routes = require('./routes.js');

twitter = require('./twitter-watcher.js');

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
  app.get('/testPrint', routes.testPrint);
  app.get('/queueTest', routes.queueTest);
  app.get('/message/:id', routes.message);
  app.post('/answer', routes.answer);
  app.get('/answers/delete/:id', routes.deleteAnswer);
  app.post('/answers/edit/:id', routes.editAnswer);
  return http.createServer(app).listen(app.get('port'), function() {
    return console.log('St. Martyr Bride running on port ' + app.get('port'));
  });
};
