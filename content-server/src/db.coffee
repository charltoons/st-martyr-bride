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

getPatron = (handle, cb)->
    console.log 'get patron '+handle
    params = 
        where:
            handle: handle

    kaiseki.getObjects 'Patron', params, (err, res, body, success)->
        unless success then cb(err)
        else 
            switch body.length
                when 1 then cb(null, body[0])
                when 0 then cb(null, false)
                else cb('Error: invalid number of users with handle '+handle+'.')

createPatron = (patron, cb)->
    console.log 'creating patron '+patron.handle 
    kaiseki.createObject 'Patron', patron, (err, res, body, success)->
        unless success then cb(err)
        else cb(null, body.objectId)

newQuestion = (patronId, body, cb)->
    console.log 'new question'
    q = 
        patron: 
            __type: 'Pointer'
            className: 'Patron'
            objectId: patronId
        body: body
    kaiseki.createObject 'Question', q, (err, res, body, success)->
        unless success then cb(err)
        else
            cb(null, body.objectId)

createQuestion = (question, cb)->
    console.log 'creating question'
    getPatron question.patron.handle, (err, result)->
        if err? then cb(err)
        else if not result
            console.log 'No patron exists with that handle'
            createPatron question.patron, (err, result)->
                if err? then cb(err)
                else newQuestion result, question.body, cb
                    
        else
            console.log 'we already have a patron with that handle' 
            newQuestion result, question.body, cb

createAnswer = (body, type, cb)->
    a =
        body: body
        type: type
    kaiseki.createObject 'Answer', a, (err, res, body, success)->
        unless success then cb(err)
        else
            cb(null, body.objectId)

# returns a random answer of type type 
# if no type is specified, then it will return a
# random answer of any type
getRandomAnswer = (type, cb)->
    if type 
        params = 
            where:
                type: type
        kaiseki.getObjects 'Answer', params, (err, res, body, success)->
            unless success then cb(err)
            else 
                randomAnswer = body[Math.floor(Math.random() * body.length)]
                cb(err, randomAnswer)
        


# question = 
#     patron: 
#         first: 'Roseanne'
#         handle: '@rb27332491'
#         last: 'Barr'
#     body: 'Why do some stores in Tulsa have a "Sorry, we\'re open" sign?'
exports.createQuestion = createQuestion
exports.createAnswer = createAnswer
exports.getAnswers = getAnswers
exports.getRandomAnswer = getRandomAnswer