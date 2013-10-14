var PostCode, T, Twit, db, events, fs, http, print, querystring, settings, stream, tweetBack, tweetEvent;

Twit = require('twit');

settings = require('../settings.json');

db = require('./db.js');

events = require('events');

querystring = require('querystring');

http = require('http');

fs = require('fs');

T = new Twit({
  consumer_key: settings.twitter.api_key,
  consumer_secret: settings.twitter.api_secret,
  access_token: settings.twitter.access_token,
  access_token_secret: settings.twitter.access_token_secret
});

stream;

tweetEvent = new events.EventEmitter();

stream = T.stream('statuses/filter', {
  track: '@StMartyrBride'
});

tweetBack = function(answer, handle, tweet_id) {
  return T.post('statuses/update', {
    status: handle + ', ' + answer,
    in_reply_to_status_id: tweet_id
  }, function(err, reply) {
    if (err != null) {
      return console.error(err);
    } else {
      return console.log('TW: Replied to tweet.');
    }
  });
};

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

print = function(messageId) {
  return PostCode('http://charl.to:3000/message/' + messageId);
};

stream.on('tweet', function(tweet) {
  var handle, name, question, twitter_url;
  twitter_url = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
  handle = '@' + tweet.user.screen_name;
  name = tweet.user.name;
  question = {
    patron: {
      name: tweet.user.name,
      handle: '@' + tweet.user.screen_name
    },
    body: tweet.text,
    tweetUrl: twitter_url
  };
  db.createQuestion(question, function(err, questionId) {
    if (err != null) {
      return console.error(err);
    } else {
      return db.createMessage(questionId, function(err, messageId) {
        if (err != null) {
          return console.error(err);
        } else {
          return db.getRandomAnswer('test', function(err, answerId, answerBody) {
            if (err != null) {
              return console.error(err);
            } else {
              return db.addAnswerToMessage(answerId, messageId, function(err, success) {
                if (err != null) {
                  return console.error(err);
                } else {
                  console.log('TW: Successfully created new message in db.');
                  tweetBack(answerBody, question.patron.handle, tweet.id_str);
                  return print(messageId);
                }
              });
            }
          });
        }
      });
    }
  });
  return tweetEvent.emit('tweet');
});
