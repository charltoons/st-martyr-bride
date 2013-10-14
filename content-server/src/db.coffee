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
    params = 
        where:
            handle: handle

    kaiseki.getObjects 'Patron', params, (err, res, body, success)->
        unless success then cb(err)
        else 
            switch body.length
                when 1 then cb(null, body[0].objectId)
                when 0 then cb(null, false)
                else cb('Error: invalid number of users with handle '+handle+'.')

createPatron = (patron, cb)->
    console.log 'DB: Creating patron '+patron.handle 
    kaiseki.createObject 'Patron', patron, (err, res, body, success)->
        unless success then cb(err)
        else cb(null, body.objectId)

newQuestion = (patronId, body, tweetUrl, cb)->
    q = 
        patron: 
            __type: 'Pointer'
            className: 'Patron'
            objectId: patronId
        body: body
        tweetUrl: tweetUrl
    kaiseki.createObject 'Question', q, (err, res, body, success)->
        unless success then cb(err)
        else
            cb(null, body.objectId)

createQuestion = (question, cb)->
    console.log 'DB: Creating question '+question.tweetUrl
    getPatron question.patron.handle, (err, result)->
        if err? then cb(err)
        else if not result
            createPatron question.patron, (err, result)->
                if err? then cb(err)
                else newQuestion result, question.body, question.tweetUrl, cb
                    
        else
            console.log 'DB: Another question from '+question.patron.handle 
            newQuestion result, question.body, question.tweetUrl, cb

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
                cb(err, randomAnswer.objectId)

createMessage = (questionId, cb)->
    m = 
        question:
            __type: 'Pointer'
            className: 'Question'
            objectId: questionId
        isPrinted: false

    kaiseki.createObject 'Message', m, (err, res, body, success)->
        unless success then cb(err)
        else
            cb(null, body.objectId)

addAnswerToMessage = (answerId, messageId, cb)->
    answer = 
        answer: 
            __type: 'Pointer'
            className: 'Answer'
            objectId: answerId

    kaiseki.updateObject 'Message', messageId, answer, (err, res, body, success)->
        unless success then cb(err)
        else cb(null, true)

exports.createQuestion = createQuestion
exports.createAnswer = createAnswer
exports.getAnswers = getAnswers
exports.getRandomAnswer = getRandomAnswer
exports.createMessage = createMessage
exports.addAnswerToMessage = addAnswerToMessage