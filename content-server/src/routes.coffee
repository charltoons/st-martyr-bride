db = require ('./db.js')


exports.index = (req, res)->
  res.render 'index',  title: 'Express' 

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