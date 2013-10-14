Twit = require 'twit'
settings = require '../settings.json'
db = require './db.js'
events = require 'events'
querystring = require('querystring')
http = require('http')
fs = require('fs')

T = new Twit
    consumer_key: settings.twitter.api_key
    consumer_secret: settings.twitter.api_secret
    access_token: settings.twitter.access_token
    access_token_secret: settings.twitter.access_token_secret

#global scope
stream 
tweetEvent = new events.EventEmitter()

stream = T.stream 'statuses/filter', track: '@StMartyrBride'

tweetBack = (answer, handle, tweet_id)->
    T.post 'statuses/update', 
        status: handle+', '+answer
        in_reply_to_status_id: tweet_id,
        (err, reply)->
            if err? then console.error err
            else console.log 'TW: Replied to tweet.'

PostCode = (url)->
    # Build the post string from an object
    post_data = querystring.stringify 
        'url' : url

    # An object of options to indicate where to post to
    post_options =
    host: 'printer.gofreerange.com'
    port: '80'
    path: '/print/8m3m5y0s8a5w8k7t'
    method: 'POST'
    headers: 
        'Content-Type': 'application/x-www-form-urlencoded'
        'Content-Length': post_data.length

    # Set up the request
    post_req = http.request post_options, (res)->
        res.setEncoding('utf8')
        res.on('data', (chunk)-> console.log('Response: ' + chunk))

    # post the data
    post_req.write(post_data)
    post_req.end()

print = (messageId)->
    PostCode('http://charl.to:3000/message/'+messageId)

# init tweet handler
# exports.init = ->
stream.on 'tweet', (tweet)-> 
    twitter_url = 'https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str
    handle = '@'+tweet.user.screen_name
    name = tweet.user.name
    question = 
        patron :
            name: tweet.user.name
            handle: '@'+tweet.user.screen_name
        body : tweet.text
        tweetUrl: twitter_url

    # send it to the db
    db.createQuestion question, (err, questionId)->
        if err? then console.error err
        else db.createMessage questionId, (err, messageId)->
            if err? then console.error err
            else db.getRandomAnswer 'test', (err, answerId, answerBody)->
                if err? then console.error err
                else db.addAnswerToMessage answerId, messageId, (err, success)->
                    if err? then console.error err
                    else 
                        console.log 'TW: Successfully created new message in db.'
                        tweetBack(answerBody, question.patron.handle, tweet.id_str)
                        print(messageId)
    tweetEvent.emit('tweet')
    # tweetEvent


# { created_at: 'Sun Oct 13 22:34:27 +0000 2013',
#   id: 389519530911105000,
#   id_str: '389519530911105025',
#   text: '@StMartyrBride what\'s going on?',
#   source: '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>',
#   truncated: false,
#   in_reply_to_status_id: null,
#   in_reply_to_status_id_str: null,
#   in_reply_to_user_id: 1906527878,
#   in_reply_to_user_id_str: '1906527878',
#   in_reply_to_screen_name: 'StMartyrBride',
#   user:
#    { id: 1317317744,
#      id_str: '1317317744',
#      name: 'Rosanne Barr',
#      screen_name: 'rb27332491',
#      location: '',
#      url: null,
#      description: null,
#      protected: false,
#      followers_count: 1,
#      friends_count: 1,
#      listed_count: 0,
#      created_at: 'Sat Mar 30 22:50:28 +0000 2013',
#      favourites_count: 0,
#      utc_offset: null,
#      time_zone: null,
#      geo_enabled: false,
#      verified: false,
#      statuses_count: 43,
#      lang: 'en',
#      contributors_enabled: false,
#      is_translator: false,
#      profile_background_color: 'C0DEED',
#      profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
#      profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
#      profile_background_tile: false,
#      profile_image_url: 'http://a0.twimg.com/profile_images/3453739219/2e10616068e614dc739de6cc89ffb8da_normal.jpeg',
#      profile_image_url_https: 'https://si0.twimg.com/profile_images/3453739219/2e10616068e614dc739de6cc89ffb8da_normal.jpeg',
#      profile_link_color: '0084B4',
#      profile_sidebar_border_color: 'C0DEED',
#      profile_sidebar_fill_color: 'DDEEF6',
#      profile_text_color: '333333',
#      profile_use_background_image: true,
#      default_profile: true,
#      default_profile_image: false,
#      following: null,
#      follow_request_sent: null,
#      notifications: null },
#   geo: null,
#   coordinates: null,
#   place: null,
#   contributors: null,
#   retweet_count: 0,
#   favorite_count: 0,
#   entities:
#    { hashtags: [],
#      symbols: [],
#      urls: [],
#      user_mentions: [ [Object] ] },
#   favorited: false,
#   retweeted: false,
#   filter_level: 'medium',
#   lang: 'en' }
