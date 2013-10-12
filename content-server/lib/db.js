var APP_ID, Kaiseki, REST_API_KEY, getAnswers, kaiseki, settings;

Kaiseki = require('kaiseki');

settings = require('../settings.json');

APP_ID = settings.parse.app_id;

REST_API_KEY = settings.parse.api_key;

kaiseki = new Kaiseki(APP_ID, REST_API_KEY);

getAnswers = function(cb) {
  var params;
  params = {
    where: {
      type: "test"
    }
  };
  return kaiseki.getObjects('Answer', params, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body);
    }
  });
};

getAnswers(function(err, results) {
  return console.log(results);
});
