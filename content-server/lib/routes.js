var db;

db = require('./db.js');

exports.index = function(req, res) {
  return res.render('index', {
    title: 'Express'
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
