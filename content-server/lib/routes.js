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

exports.testPrint = function(req, res) {
  var PostCode, post_data, post_options, post_req;
  PostCode = function(url) {};
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
  post_req.end();
  PostCode('http://charl.to:3000/testPrint');
  return res.render('testPrint');
};
