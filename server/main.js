const createHmac = require('create-hmac')
const fetch = require('node-fetch')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')

function sign(queryString, apiSecret) {
  return createHmac('sha256', Buffer.from(apiSecret)).update(queryString).digest('hex')
}

async function getAccountInformation(apiKey, apiSecret) {
  const queryString = `timestamp=${Date.now()}`
  const signature = sign(queryString, apiSecret)
  try {
    const resp = await fetch('https://api.binance.com/api/v3/account' + '?' + queryString + '&signature=' + signature, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    })
    const data = await resp.json()
    const { balances } = data
    balances.sort((a, b) => {
      const aa = parseFloat(a.free)
      const bb = parseFloat(b.free)
      return bb - aa
    })
    const result = balances.slice(0, 20).filter(e => {
      const free = parseFloat(e.free)
      return free > 0
    })
    return result.map(e => ({
      amount: parseFloat(e.free),
      pair: e.asset
    }))
  } catch (err) {
    throw err
  }
}

async function getHoldForAsset(asset, apiKey, apiSecret) {
  const queryString = `symbol=${asset.toUpperCase()}USDT&timestamp=${Date.now()}`
  const signature = sign(queryString, apiSecret)
  try {
    const resp = await fetch('https://api.binance.com/api/v3/myTrades' + '?' + queryString + '&signature=' + signature, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    })
    const trades = await resp.json()
    let price = 0
    for (const trade of Array.from(trades)) {
      const isBuy = trade.isBuyer
      if (isBuy) {
        price = parseFloat(trade.price)
      }
    }
    return { price }
  } catch (err) {
    throw err
  }
}

async function getHoldForAssets(assets, apiKey, apiSecret) {
  const result = []
  for (const asset of assets) {
    try {
      const { price } = await getHoldForAsset(asset.pair, apiKey, apiSecret)
      result.push({
        pair: asset.pair,
        amount: asset.amount,
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
  const { apiKey, apiSecret } = req.body
  try {
    const assets = await getAccountInformation(apiKey, apiSecret)
    const data = await getHoldForAssets(assets, apiKey, apiSecret)
    res.send({
      pairs: assets.map(e => e.pair),
      holds: data
    })
  } catch (err) {
    res.status(400).send({
      err: err.message
    })
  }
})

const port = process.env.PORT || 8989
app.listen(port, () => {
  console.log(`Binance server listening at http://localhost:${port}`)
})
