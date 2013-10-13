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
    return db.createMessage(questionId, function(err, messageId) {
      return db.getRandomAnswer('test', function(err, answerId) {
        return db.addAnswerToMessage(answerId, messageId, function(err, success) {
          if (success != null) {
            return console.log('success');
          }
        });
      });
    });
  });
  return tweetEvent.emit('tweet');
});
