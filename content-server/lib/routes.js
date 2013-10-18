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
    patronsTodayCount: db.countTodayPatrons
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
        }
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

exports.testPrint = function(req, res) {
  var PostCode;
  PostCode = function(url) {
    var post_data, post_options, post_req;
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
    post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      return res.on('data', function(chunk) {
        return console.log('Response: ' + chunk);
      });
    });
    post_req.write(post_data);
    return post_req.end();
  };
  PostCode('http://charl.to:3000/testPrint');
  return res.render('testPrint');
};
