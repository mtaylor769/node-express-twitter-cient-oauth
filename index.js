const express = require("express")
const request = require("request")
const _ = require("lodash")
const json = require('json')
const Twit = require("twit")
const app = express()
app.locals.strftime = require("strftime")
app.locals.title = "ManageSocial Test"
app.locals.email = "mike@whatsmycut.com"
app.set('view engine', 'ejs')

const config = require("./config")
const T = new Twit(config)
let tcreds = []

app.get("/", function (req, res) {
  res.render('login', { title: 'Manage Social Test', message: 'Hello there!' })
})

app.get("/oauth_request", function (req, res) {
  res.type("text/plain")
  T.post("https://api.twitter.com/oauth/request_token", 
    { 
      skip_status: true, 
      oauth_callback:"http%3A%2F%2Flocalhost%3A8080%2Fsign-in-with-twitter%2F",
      oauth_consumer_key: config.consumer_key,
      oauth_nonce:"ea9ec8429b68d6b77cd5600adbbb0456",
      oauth_signature:config.app_only_auth,
      oauth_signature_method:"HMAC-SHA1",
      oauth_timestamp:Date.now(),
      oauth_version:"1.0"
    })
  .catch(function (err) {
    console.log("caught error", err.stack)
  })
  .then(function (result) {
    let pairs = result.data.split('&')
    let vals = []
    _.each(pairs, function(t) {
      let sp = t.split('=')
      vals[sp[0]] = sp[1]
    })
    tcreds = vals
    res.status(302).redirect("/sign-in-with-twitter")
  })
  
})

app.get("/sign-in-with-twitter", function(req, res){
  console.log("/sign-in-with-twitter called", req.query)
  if (undefined === req.query['oauth_verifier']) {
    T.get('https://api.twitter.com/oauth/authenticate', {'oauth_token': tcreds['oauth_token']})
    .catch(function (err) {
      console.log("caught error", err.stack)
    })
    .then(function (result) {
      res.send(result.data)
    })
  } else {
    //tcreds.concat(req.query)
    T.post('https://api.twitter.com/oauth/access_token', 
      {
        oauth_consumer_key: config.consumer_key,
        oauth_nonce:"ea9ec8429b68d6b77cd5600adbbb0456",
        oauth_signature:config.app_only_auth,
        oauth_signature_method:"HMAC-SHA1",
        oauth_timestamp:Date.now(),
        oauth_version:"1.0",
        oauth_token: req.query['oauth_token'],
        oauth_verifier: req.query['oauth_verifier']
      })
    .catch(function (err) {
      console.log("caught error", err.stack)
    })
    .then(function (result) {
      console.log("posted result", result.data)
      let pairs = result.data.split('&')
      let vals = []
      _.each(pairs, function(t) {
        let sp = t.split('=')
        vals[sp[0]] = sp[1]
      })
      tcreds.concat(vals)
      console.log(tcreds)
      res.status(200).redirect('/tweets')
    })
  
  //  res.status(200).redirect('/tweets')
  }
})

app.post("/connect", function(req, res){
  // TODO: Get User Creds
  console.log("connect: tcreds", tcreds)
})

app.get("/tweets", function(req, res){
  // TODO: Get Tweets
  console.log("tweets: tcreds", tcreds)
  res.render('tweets', {tweets: [{name: 'one'},{name: 'two'}]})
})

app.post("/disconnect", function(req, res){
  // TODO: Disconnect user
  res.send("disconnect!")
})

app.listen(8080, function () {
  console.log("Listening on port 8080.")
})

module.exports = app