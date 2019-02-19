'use strict';

var express = require('express');
var mongo = require('mongodb');
var dns = require('dns')
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGODB_URI || "mongodb://EricHeredia:asdf1234@ds213832.mlab.com:13832/cloudbase", {useMongoClient: true} );

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

var Schema = mongoose.Schema
var urlSchema = new Schema({
  original_url: String,
  short_url: String
})
var ShortUrl = mongoose.model('ShortUrl', urlSchema)

// shorturl
app.post('/api/shorturl/new', function(req, res) {

  var regExpr = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g

  if (regExpr.test(req.body.url) == true) {

    var urls = new ShortUrl({
      original_url: req.body.url,
      short_url: Math.floor(Math.random() * 50000)
    })
      
    urls.save()
  
    res.json({original_url: urls.original_url, short_url: urls.short_url})
  } else {
    res.json({error: "invalid URL"})
  }
})

// shurturl lookup and redirect
app.post('/api/shorturl/goto', function(req, res) {
  var shortUrlVar = String(req.body.shorturl)
  ShortUrl.findOne({short_url: shortUrlVar}, (err, data) => {
    if (data == null) {
      return res.json({error: "invalid URL"})
    } else {
      res.redirect(data.original_url)
    }
  })
})

app.get("/api/shorturl/:shortVar", function(req, res) {

  var shortVar = String(req.params.shortVar)
  ShortUrl.findOne({short_url: shortVar}, (err, data) => {
    if (data == null) {
      return res.json({error: "invalid URL"})
    } else {
      res.redirect(data.original_url)
    }
  })

})

app.listen(port, function () {
  console.log('Node.js listening ...');
});