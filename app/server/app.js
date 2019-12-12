'use strict'
/* jshint esversion: 6, asi: true, node: true */
// app.js

const compression = require('compression')
const config = require('./app_config')
const express = require('express')
const http = require('http')
const logger = require('morgan')
const path = require('path')
const socketIo = require('socket.io')
const bodyParser = require('body-parser')

const expressOptions = require('./expressOptions')
const myutil = require('./util')
const socket = require('./socket')
const sshSessionConfig = require('./ssh_session_config')

// Credential Token Store
const DEFAULT_CC_TTL = 60 * 1000 * 5
const cachedCredentials = {}
function cachedCredentialSetTTL (key, ttl) {
  setTimeout(() => {
    console.log()
    delete cachedCredentials[key]
  }, ttl)
}

var session = require('express-session')({
  secret: config.session.secret,
  name: config.session.name,
  resave: true,
  saveUninitialized: false,
  unset: 'destroy'
})

myutil.setDefaultCredentials(config.user.name, config.user.password, config.user.privatekey)

// express
const app = express()
const server = http.Server(app)
const io = socketIo(server, { serveClient: false })
app.use(bodyParser.json())
app.use(compression({ level: 9 }))
app.use(session)
// app.use(myutil.basicAuth)
if (config.accesslog) app.use(logger('common'))
app.disable('x-powered-by')

// static files
const publicPath = path.join(path.dirname(require.main.filename), 'client', 'public')
app.use(express.static(publicPath, expressOptions))

app.get('/reauth', function (req, res, next) {
  var r = req.headers.referer || '/'
  res.status(401).send('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=' + r + '"></head><body bgcolor="#000"></body></html>')
})

// eslint-disable-next-line complexity
app.get('/ssh/host/:host?', function (req, res, next) {
  res.sendFile(path.join(path.join(publicPath, 'client.htm')))

  // Setup the session data
  req.session.ssh = sshSessionConfig(config, Object.assign({}, req.params, req.query, req.headers))
})

// eslint-disable-next-line complexity
app.get('/ssh/token_session/:token', function (req, res, next) {
  const token = req.params.token
  const creds = cachedCredentials[token]

  if (creds) {
    delete cachedCredentials[token]
    res.sendFile(path.join(path.join(publicPath, 'client.htm')))

    const { username, userpassword, host, port } = creds

    // Setup the session data
    req.session.username = username
    req.session.userpassword = userpassword
    req.session.ssh = sshSessionConfig(config, Object.assign({}, req.query, req.headers, { host: host, port: port }))
    console.log(`[GET] /ssh/token_session/${token} - Claimed session`)
  } else {
    console.log(`[GET] /ssh/token_session/${token} - 404`)
    res.status(404).send('<!DOCTYPE html><html><head></head><body bgcolor="#fff"><center><h1>Session Not Found</h1><p>404</p></center></body></html>')
  }
})

app.post('/ssh/set_session_credentials', (req, res) => {
  const data = req.body

  if (!data.username || !data.userpassword || !data.host) {
    res.status(400).send('{"Error": "Missing required field"}')
  } else {
    const token = myutil.uuidv4()
    const sshConfig = {
      username: data.username,
      userpassword: data.userpassword,
      host: data.host,
      port: data.port || config.ssh.port
    }

    console.log(`[POST] /ssh/set_session_credentials - ${data.host} | ${data.username} 200`)
    cachedCredentials[token] = sshConfig
    cachedCredentialSetTTL(token, DEFAULT_CC_TTL)
    res.status(200).send(JSON.stringify({ token: token, ttl: DEFAULT_CC_TTL }))
  }
})

// express error handling
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// socket.io
// expose express session with socket.request.session
io.use(function (socket, next) {
  (socket.request.res) ? session(socket.request, socket.request.res, next)
    : next(next)
})

// bring up socket
io.on('connection', socket)

module.exports = { server: server, config: config }
