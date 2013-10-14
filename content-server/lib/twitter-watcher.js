var T, Twit, db, events, settings, stream, tweetEvent;

Twit = require('twit');

settings = require('../settings.json');

db = require('./db.js');

events = require('events');

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
          return db.getRandomAnswer('test', function(err, answerId) {
            if (err != null) {
              return console.error(err);
            } else {
              return db.addAnswerToMessage(answerId, messageId, function(err, success) {
                if (err != null) {
                  return console.error(err);
                } else {
                  if (success != null) {
                    return console.log('TW: Successfully created new message in db');
                  }
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
