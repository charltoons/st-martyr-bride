var APP_ID, Kaiseki, REST_API_KEY, addAnswerToMessage, count, countToday, createAnswer, createMessage, createPatron, createQuestion, deleteAnswer, editAnswer, getAnswers, getMessage, getPatron, getRandomAnswer, kaiseki, newQuestion, settings;

Kaiseki = require('kaiseki');

settings = require('../settings.json');

APP_ID = settings.parse.app_id;

REST_API_KEY = settings.parse.api_key;

kaiseki = new Kaiseki(APP_ID, REST_API_KEY);

getAnswers = function(cb) {
  var params;
  params = {
    where: {
      type: "show"
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
  console.log('DB: Creating patron ' + patron.handle);
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
  console.log('DB: Creating question ' + question.tweetUrl);
  return getPatron(question.patron.handle, function(err, result) {
    if (err != null) {
      return cb(err);
    } else if (!result) {
      return createPatron(question.patron, function(err, result) {
        if (err != null) {
          return cb(err);
        } else {
          return newQuestion(result, question.body, question.tweetUrl, cb);
        }
      });
    } else {
      console.log('DB: Another question from ' + question.patron.handle);
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

deleteAnswer = function(id, cb) {
  return kaiseki.deleteObject('Answer', id, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.objectId);
    }
  });
};

editAnswer = function(id, body, cb) {
  return kaiseki.updateObject('Answer', id, {
    body: body
  }, function(err, res, body, success) {
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
        return cb(err, randomAnswer.objectId, randomAnswer.body);
      }
    });
  } else {
    return cb('Error: no type sent to db.getRandomAnswer');
  }
};

getAnswers = function(cb) {
  return kaiseki.getObjects('Answer', function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(err, body);
    }
  });
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

count = function(className, cb) {
  var params;
  params = {
    count: 1,
    limit: 0
  };
  return kaiseki.getObjects(className, params, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.count);
    }
  });
};

exports.countQuestions = function(cb) {
  return count('Question', cb);
};

exports.countPatrons = function(cb) {
  return count('Patron', cb);
};

countToday = function(className, cb) {
  var beforeBound, params;
  beforeBound = new Date();
  beforeBound.setHours(beforeBound.getHours() - 12);
  params = {
    count: 1,
    limit: 0,
    where: {
      createdAt: {
        '$gte': {
          __type: 'Date',
          iso: beforeBound.toISOString()
        }
      }
    }
  };
  return kaiseki.getObjects(className, params, function(err, res, body, success) {
    if (!success) {
      return cb(err);
    } else {
      return cb(null, body.count);
    }
  });
};

exports.countTodayQuestions = function(cb) {
  return countToday('Question', cb);
};

exports.countTodayPatrons = function(cb) {
  return countToday('Patron', cb);
};

getMessage = function(messageId, cb) {
  return kaiseki.getObjects('Message', {
    where: {
      objectId: messageId
    }
  }, function(err, res, body, success) {
    var message;
    if (!success) {
      return cb(err);
    } else {
      message = body[0];
      return kaiseki.getObjects('Answer', {
        where: {
          objectId: message.answer.objectId
        }
      }, function(err, res, body, success) {
        var answer;
        if (!success) {
          return cb(err);
        } else {
          answer = body[0];
          return kaiseki.getObjects('Question', {
            where: {
              objectId: message.question.objectId
            }
          }, function(err, res, body, success) {
            var question;
            if (!success) {
              return cb(err);
            } else {
              question = body[0];
              return kaiseki.getObjects('Patron', {
                where: {
                  objectId: question.patron.objectId
                }
              }, function(err, res, body, success) {
                var patron;
                if (err != null) {
                  return cb(err);
                } else {
                  patron = body[0];
                  return cb(null, patron, question, answer);
                }
              });
            }
          });
        }
      });
    }
  });
};

exports.getMessage = getMessage;

exports.createQuestion = createQuestion;

exports.createAnswer = createAnswer;

exports.deleteAnswer = deleteAnswer;

exports.editAnswer = editAnswer;

exports.getAnswers = getAnswers;

exports.getRandomAnswer = getRandomAnswer;

exports.createMessage = createMessage;

exports.addAnswerToMessage = addAnswerToMessage;

exports.count = count;
