function monitor(e = 'BTC', threshold = 0.1) {
  console.log(`Started monitoring ${e} at a threshold ${threshold}`)

  // Global vars
  let price = 0.0
  const prices = []
  let diffs = 0.0

  const WebSocket = require('ws')
  const connectStr = `${e.toLowerCase()}usdt@aggTrade`
  const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + connectStr)

  socket.on('message', raw => {
    const data = JSON.parse(raw).data
    const priceUpdate = parseFloat(data.p)
    price = priceUpdate
  })

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
    // Big change
    if (diffs > threshold || diffs < -threshold) {
      // Send notify
      console.log('Big change: ' + diffs)
      const positive = `+${threshold * 10}%`
      const negative = `-${threshold * 10}%`
      sendNotify(`${e} has just modifed ${diffs > 0 ? positive : negative}, current price is ${price}`)
      diffs = 0
    }
  }, 1000)

  function stopWatchers() {
    clearInterval(watcher1)
    clearInterval(watcher2)
    clearInterval(watcher3)
    socket.close()
  }

  return { stopWatchers }
}

function sendNotify(msg, token = 'MFm1y1zojjw2BP7SY8lTymGrcYclaJmWw5PwbYuJ60C') {
  const axios = require('axios')
  const qs = require('querystring')
  console.log(msg)
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }
  const obj = {
    message: msg
  }

  const { data } = axios.post('https://notify-api.line.me/api/notify', qs.stringify(obj), config)
  return data
}

// Start
function main() {
  const listWatch = [
    { name: 'ADA', threshold: 0.1 },
    { name: 'ETH', threshold: 0.1 },
    { name: 'BTC', threshold: 0.1 },
    { name: 'DOGE', threshold: 0.1 },
  ]

  listWatch.forEach(e => monitor(e.name, e.threshold))
}

main()
