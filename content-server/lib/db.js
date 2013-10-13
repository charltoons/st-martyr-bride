var APP_ID, Kaiseki, REST_API_KEY, addAnswerToMessage, createAnswer, createMessage, createPatron, createQuestion, getAnswers, getPatron, getRandomAnswer, kaiseki, newQuestion, settings;

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

newQuestion = function(patronId, body, tweetUrl, cb) {
  var q;
  console.log('new question');
  q = {
    patron: {
      __type: 'Pointer',
      className: 'Patron',
      objectId: patronId
    },
    body: body,
    tweetUrl: tweetUrl
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
          return newQuestion(result, question.body, question.tweetUrl, cb);
        }
      });
    } else {
      console.log('we already have a patron with that handle');
      return newQuestion(result, question.body, question.tweetUrl, cb);
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
        return cb(err, randomAnswer.objectId);
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

addAnswerToMessage = function(answerId, messageId, cb) {
  var answer;
  answer = {
    answer: {
      __type: 'Pointer',
      className: 'Answer',
      objectId: answerId
    }
  };
  return kaiseki.updateObject('Message', messageId, answer, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, true);
    }
  });
};

exports.createQuestion = createQuestion;

exports.createAnswer = createAnswer;

exports.getAnswers = getAnswers;

exports.getRandomAnswer = getRandomAnswer;

exports.createMessage = createMessage;

exports.addAnswerToMessage = addAnswerToMessage;
