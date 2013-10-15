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

exports.testPrint = (req, res)->
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

    PostCode('http://charl.to:3000/testPrint');

    res.render 'testPrint'