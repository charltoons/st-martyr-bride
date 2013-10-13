var T, Twit, settings, stream;

Twit = require('twit');

settings = require('../settings.json');

T = new Twit({
  consumer_key: settings.twitter.api_key,
  consumer_secret: settings.twitter.api_secret,
  access_token: settings.twitter.access_token,
  access_token_secret: settings.twitter.access_token_secret
});

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
  return console.log(question);
});
