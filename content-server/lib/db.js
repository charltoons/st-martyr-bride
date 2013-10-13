var APP_ID, Kaiseki, REST_API_KEY, createAnswer, createMessage, createPatron, createQuestion, getAnswers, getPatron, getRandomAnswer, kaiseki, newQuestion, question, settings;

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

getPatron = function(handle, cb) {
  var params;
  console.log('get patron ' + handle);
  params = {
    where: {
      handle: handle
    }
  };
  return kaiseki.getObjects('Patron', params, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      switch (body.length) {
        case 1:
          return cb(null, body[0].objectId);
        case 0:
          return cb(null, false);
        default:
          return cb('Error: invalid number of users with handle ' + handle + '.');
      }
    }
  });
};

createPatron = function(patron, cb) {
  console.log('creating patron ' + patron.handle);
  return kaiseki.createObject('Patron', patron, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.objectId);
    }
  });
};

newQuestion = function(patronId, body, cb) {
  var q;
  console.log('new question');
  q = {
    patron: {
      __type: 'Pointer',
      className: 'Patron',
      objectId: patronId
    },
    body: body
  };
  return kaiseki.createObject('Question', q, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.objectId);
    }
  });
};

createQuestion = function(question, cb) {
  console.log('creating question');
  return getPatron(question.patron.handle, function(err, result) {
    if (err != null) {
      return cb(err);
    } else if (!result) {
      console.log('No patron exists with that handle');
      return createPatron(question.patron, function(err, result) {
        if (err != null) {
          return cb(err);
        } else {
          return newQuestion(result, question.body, cb);
        }
      });
    } else {
      console.log('we already have a patron with that handle');
      return newQuestion(result, question.body, cb);
    }
  });
};

createAnswer = function(body, type, cb) {
  var a;
  a = {
    body: body,
    type: type
  };
  return kaiseki.createObject('Answer', a, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.objectId);
    }
  });
};

getRandomAnswer = function(type, cb) {
  var params;
  if (type) {
    params = {
      where: {
        type: type
      }
    };
    return kaiseki.getObjects('Answer', params, function(err, res, body, success) {
      var randomAnswer;
      if (!success) {
        return cb(err);
      } else {
        randomAnswer = body[Math.floor(Math.random() * body.length)];
        return cb(err, randomAnswer);
      }
    });
  }
};

createMessage = function(questionId, cb) {
  var m;
  m = {
    question: {
      __type: 'Pointer',
      className: 'Question',
      objectId: questionId
    },
    isPrinted: false
  };
  return kaiseki.createObject('Message', m, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.objectId);
    }
  });
};

question = {
  patron: {
    name: 'Roseanne Barr',
    handle: '@rb27332491'
  },
  body: 'Why do some stores in Tulsa have a "Sorry, we\'re open" sign?',
  tweetUrl: 'https://twitter.com/rb27332491/status/389521185433989121'
};

createQuestion(question, function(err, questionId) {
  return createMessage(questionId, function(err, messageId) {
    return console.log(messageId);
  });
});

exports.createQuestion = createQuestion;

exports.createAnswer = createAnswer;

exports.getAnswers = getAnswers;

exports.getRandomAnswer = getRandomAnswer;
