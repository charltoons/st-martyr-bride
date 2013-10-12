Kaiseki = require 'kaiseki'
settings = require '../settings.json'

APP_ID = settings.parse.app_id
REST_API_KEY = settings.parse.api_key
kaiseki = new Kaiseki APP_ID, REST_API_KEY

getAnswers = (cb)->
    params = 
      where: 
        type: "test"

    kaiseki.getObjects 'Answer', params, (err, res, body, success)->
        unless success then cb(err)
        else cb(null, body)

getAnswers (err, results)->
    console.log results