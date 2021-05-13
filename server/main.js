const createHmac = require('create-hmac')
const fetch = require('node-fetch')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

async function getHoldForSingleSymbol(symbol, apiKey, apiSecret) {
  function sign(queryString) {
    return createHmac('sha256', Buffer.from(apiSecret)).update(queryString).digest('hex')
  }

  const queryString = `symbol=${symbol.toUpperCase()}USDT&timestamp=${Date.now()}`
  const signature = sign(queryString)
  try {
    const resp = await fetch('https://api.binance.com/api/v3/myTrades' + '?' + queryString + '&signature=' + signature, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    })
    const trades = await resp.json()
    let amount = 0
    let price = 0
    for (const trade of trades) {
      const isBuy = trade.isBuyer
      if (isBuy) {
        amount += parseFloat(trade.qty)
        price = parseFloat(trade.price)
      } else {
        amount -= parseFloat(trade.qty)
      }
    }
    return { amount, price }
  } catch (err) {
    throw err
  }
}

async function getHoldForSymbols(symbols, apiKey, apiSecret) {
  const result = []
  for (const symbol of symbols) {
    try {
      const { amount, price } = await getHoldForSingleSymbol(symbol, apiKey, apiSecret)
      result.push({
        pair: symbol,
        amount,
        price
      })
    } catch (err) {
      throw err
    }
  }
  return result
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/holding', async function (req, res) {
  const { symbols, apiKey, apiSecret } = req.body
  try {
    const data = await getHoldForSymbols(symbols, apiKey, apiSecret)
    res.send(data)
  } catch (err) {
    res.status(400).send({
      err: err.message
    })
  }
})

const port = process.env.PORT || 1234
app.listen(port, () => {
  console.log(`Binance server listening at http://localhost:${port}`)
})
