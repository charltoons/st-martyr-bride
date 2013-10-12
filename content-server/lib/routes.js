var answers;

answers = [];

exports.index = function(req, res) {
  return res.render('index', {
    title: 'Express'
  });
};

exports.message = function(req, res) {
  return res.render('message');
};
