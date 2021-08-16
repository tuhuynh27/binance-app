const WebSocket = require('ws')
const axios = require('axios')
const qs = require('querystring')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

let logs = []
const appState = {
  isReloading: false
}

function monitor(e = 'BTC', threshold = 1) {
  console.log(`Started monitoring ${e} at a threshold ${threshold}`)

  let price = 0.0
  const prices = []
  let diffs = 0.0
  let combo = 0

  let socket = null

  function connect() {
    const connectStr = `${e.toLowerCase()}usdt@aggTrade`
    socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + connectStr)

    socket.on('message', raw => {
      const data = JSON.parse(raw).data
      price = parseFloat(data.p)
    })

    socket.onclose = function (e) {
      console.log(`Socket ${connectStr} is closed, reconnecting...`)
      sendNotify(`Socket for ${e} is closed, reconnecting...`)
      setTimeout(() => connect(), 5000)
    }
  }

  connect()

  const watcher1 = setInterval(() => {
    if (prices.length > 10) {
      prices.push(price)
      prices.shift()
    } else {
      prices.push(price)
    }
  }, 1000)

  const watcher2 = setInterval(() => {
    if (prices.length < 10) {
      return
    }

    const diff = ((prices[9] / prices[0]) - 1)
    diffs += diff
  }, 1000)

  // Watcher
  const watcher3 = setInterval(() => {
    if (prices.length < 10) {
      return
    }

    // Big change
    if (diffs > (threshold / 10) || diffs < -(threshold / 10)) {
      // Send notify
      const positive = `+${threshold}%`
      const negative = `-${threshold}%`
      const msg = `${e} has just modified ${diffs > 0 ? positive : negative}, current price is ${price}`
      combo += diffs > 0 ? 1 : -1
      logs.push(msg)
      sendNotify(msg)
      if (combo >= 3) {
        const comboMsg = `${e} is having a bull-run!`
        sendNotify(comboMsg)
        combo = 0
      }
      if (combo <= -3) {
        const comboMsg = `${e} is crashing!`
        sendNotify(comboMsg)
        combo = 0
      }
      diffs = 0
    }
  }, 1000)

  function stopWatchers() {
    clearInterval(watcher1)
    clearInterval(watcher2)
    clearInterval(watcher3)
    socket.onclose = null
    socket.terminate()
  }

  return { stopWatchers }
}

function sendNotify(msg, token = 'MHbsBarmcB59Np5Uz0WNW1DSiNpiDAPiMsDohkH7lTA') {
  if (appState.isReloading) {
    return
  }

  console.log(msg)
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  const obj = {
    message: msg
  }

  axios.post('https://notify-api.line.me/api/notify', qs.stringify(obj), config).catch(err => console.error(err))
}

// Global variable
let listWatch = [
  { name: 'ETH', threshold: 5 },
  { name: 'BTC', threshold: 5 },
]
let stoppers = []

// Start
function main() {
  sendNotify('New deployment!')

  stoppers = listWatch.map(e => {
    const { stopWatchers } = monitor(e.name, e.threshold)
    return stopWatchers
  })

  const app = express()
  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.get('/list', async function (_, res) {
    res.send({ listWatch })
  })

  app.get('/logs', async function (_, res) {
    res.send({ logs })
  })

  app.delete('/logs/clear', async function (_, res) {
    logs = []
    res.send({ message: 'Success' })
  })

  app.post('/setup', async function (req, res) {
    try {
      appState.isReloading = true
      listWatch = req.body.listWatch

      stoppers.forEach(stopFn => stopFn())

      sendNotify('Applying new changes...')

      setTimeout(() => {
        stoppers = listWatch.map(e => {
          const { stopWatchers } = monitor(e.name, e.threshold)
          return stopWatchers
        })

        sendNotify('Done!')
      }, 1000)

      setTimeout(() => {
        appState.isReloading = false
      }, 30000)

      res.send({
        message: 'Success'
      })
    } catch(err) {
      res.status(400).send({
        error: err.message
      })
    }
  })

  const port = process.env.PORT || 8990
  app.listen(port, () => {
    console.log(`Binance watcher server listening at http://localhost:${port}`)
  })
}

main()
