var async, db, fs, http, querystring;

db = require('./db.js');

querystring = require('querystring');

http = require('http');

fs = require('fs');

async = require('async');

exports.index = function(req, res) {
  return async.parallel({
    questionsCount: db.countQuestions,
    patronsCount: db.countPatrons,
    questionsTodayCount: db.countTodayQuestions,
    patronsTodayCount: db.countTodayPatrons,
    answers: db.getAnswers
  }, function(err, results) {
    if (err != null) {
      return console.error('Error: ', err);
    } else {
      return res.render('index', {
        title: '@StMartyrBride',
        today: {
          'Tweets': results.questionsTodayCount,
          'People': results.patronsTodayCount,
          'Tweets per person': results.questionsTodayCount / results.patronsTodayCount
        },
        overall: {
          'Tweets': results.questionsCount,
          'People': results.patronsCount,
          'Tweets per person': results.questionsCount / results.patronsCount
        },
        answers: results.answers
      });
    }
  });
};

exports.message = function(req, res) {
  var messageId;
  messageId = req.params.id;
  return db.getMessage(messageId, function(err, patron, question, answer) {
    console.log(patron);
    if (err != null) {
      return res.status(404).render('print-error');
    } else {
      return res.render('message', {
        patron: patron.name,
        question: question.body,
        answer: answer.body
      });
    }
  });
};

exports.queueTest = function(req, res) {
  var PostCode, response;
  PostCode = function(url) {
    var post_data, post_options, post_req, response;
    post_data = querystring.stringify({
      'url': url
    });
    post_options = {
      host: 'printer.gofreerange.com',
      port: '80',
      path: '/print/8m3m5y0s8a5w8k7t',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
      }
    };
    response = '';
    post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      return res.on('data', function(chunk) {
        return response += chunk;
      });
    });
    post_req.write(post_data);
    post_req.end();
    return response;
  };
  response = PostCode('http://charl.to:3000/testPrint');
  if (response.indexOf('<p>System status: <em>ONLINE</em></p>') === -1) {
    console.error("Error: printer server");
  }
  return res.redirect('/');
};

exports.testPrint = function(req, res) {
  return res.render('testPrint');
};

exports.answer = function(req, res) {
  return db.createAnswer(req.body.answer, 'show', function(err, result) {
    console.log('Added new answer');
    return res.redirect('/');
  });
};
