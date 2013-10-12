exports.index = (req, res)->
  res.render 'index',  title: 'Express' 

exports.message = (req, res)->
    res.render 'message'