db = require ('./db.js')
querystring = require('querystring')
http = require('http')
fs = require('fs')
async = require('async')

exports.index = (req, res)->

  async.parallel
    questionsCount: db.countQuestions
    patronsCount: db.countPatrons
    questionsTodayCount: db.countTodayQuestions
    patronsTodayCount: db.countTodayPatrons
    answers: db.getAnswers,
    (err, results)->
      if err? then console.error 'Error: ', err
      else 
        res.render 'index',  
          title: '@StMartyrBride'
          today: 
            'Tweets': results.questionsTodayCount
            'People': results.patronsTodayCount
            'Tweets per person': (results.questionsTodayCount/results.patronsTodayCount)
          overall:
            'Tweets': results.questionsCount
            'People': results.patronsCount
            'Tweets per person': (results.questionsCount/results.patronsCount)
          answers: results.answers


exports.message = (req, res)->
    messageId = req.params.id

    db.getMessage messageId, (err, patron, question, answer)->
        console.log patron
        if err? then res.status(404).render 'print-error'
        else
            res.render 'message',
                patron: patron.name
                question: question.body
                answer: answer.body


exports.queueTest = (req, res)->
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

    response = ''

    # Set up the request
    post_req = http.request post_options, (res)->
      res.setEncoding('utf8')
      res.on 'data', (chunk)-> response+=chunk


    post_req.write(post_data)
    post_req.end()
    response

  response = PostCode('http://charl.to:3000/testPrint')
  if response.indexOf('<p>System status: <em>ONLINE</em></p>') is -1 then console.error "Error: printer server"
  res.redirect '/'

exports.testPrint = (req, res)->
    res.render 'testPrint'

exports.answer = (req, res)->
  db.createAnswer req.body.answer, 'show', (err, result)->
    console.log 'Added new answer'
    res.redirect '/'

exports.deleteAnswer = (req, res)->
  db.deleteAnswer req.params.id, (err, result)->
    console.log 'Deleted answer'
    res.redirect '/'

exports.editAnswer = (req, res)->
  db.editAnswer req.params.id, req.body.answer, (err, result)->
    console.log 'Edited Answer'
    res.redirect '/'