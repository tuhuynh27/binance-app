const WebSocket = require('ws')
const fetch = require('node-fetch');
require('dotenv').config()

const telegramBotKey = process.env.TELEGRAM_AT_BOT_KEY;
const channelChatId = process.env.TELEGRAM_AT_CHAT_ID;
const coinmarketcapMapUrl = 'https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active';

const uri = `https://api.telegram.org/bot${telegramBotKey}`;

//----------------------------------------------------------------------------------------------------------------------

function logError(e) {
  console.error("ERROR: " + e.toString());
}

function notify(text) {
  fetch(`${uri}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: channelChatId,
      text: text,
      parse_mode: "html",
      disable_web_page_preview: true,
    })
  }).catch(e => logError(e));
}

function getCoinmarketcapMap() {
  return new Promise((resolve, reject) => {
    fetch(coinmarketcapMapUrl)
      .then(response => response.json())
      .then(data => {
        const arrayData = data.data.cryptoCurrencyMap;
        const mapData = {};
        arrayData.forEach(item => {
          mapData[item.symbol] = {
            ...item,
            url: `https://coinmarketcap.com/currencies/${item.slug}`,
          };
        });
        resolve(mapData);
      })
      .catch(err => {
        logError(err);
        reject(err);
      });
  })
}

function getPrice(symbol) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
      .then(response => response.json())
      .then(data => {
        resolve(Number(data.price).toString());
      })
      .catch(err => {
        logError(err);
        reject(err);
      });
  })
}

function getPeriodString(period) {
  switch (period) {
    case 'MINUTE_5':
      return '5 minutes'
    case 'HOUR_2':
      return '2 hours'
    case 'DAY_1':
      return '1 day'
    case 'WEEK_1':
      return '1 week'
    case 'MONTH_1':
      return '1 month'
    default:
      return period
  }
}

//----------------------------------------------------------------------------------------------------------------------

let socket = null;

const pumpCheck = {};
const pumpThreshold = 2

async function monitorAbnormalTradingNotices() {
  let coinmarketcapMap = await getCoinmarketcapMap();

  setInterval(async function() {
    coinmarketcapMap = await getCoinmarketcapMap()
  }, 1000 * 60 * 60 * 24);

  socket = new WebSocket('wss://bstream.binance.com:9443/stream?streams=abnormaltradingnotices');

  socket.on('message', async raw => {
    const data = JSON.parse(raw).data;
    data.baseAsset = data.baseAsset.toUpperCase()

    if (data.baseAsset.endsWith('UP') || data.baseAsset.endsWith('DOWN')) return;
    if (data.quotaAsset !== "USDT") return;

    const changeInPercentage = (data.priceChange > 0 ? "+" : "") + (data.priceChange * 100).toFixed(2) + "%";

    const periodStr = getPeriodString(data.priceChange);

    let message = `<a href='${coinmarketcapMap[data.baseAsset]?.url || '#'}'>${data.baseAsset}</a> <i>(#${coinmarketcapMap[data.baseAsset]?.rank || '0'})</i>`;
    let noti = false;

    // Only notify for top 30 coin
    if (parseInt(coinmarketcapMap[data.baseAsset]?.rank) >= 30) {
      return
    }

    if (['MINUTE_5', 'HOUR_2'].includes(data.period)) {
      if (pumpCheck[data.baseAsset] === undefined || pumpCheck[data.baseAsset] <= 0) {
        pumpCheck[data.baseAsset] = 0;
      }

      message += `'s price`;

      if (data.eventType === "UP_1") {
        if (data.period === "MINUTE_5") {
          pumpCheck[data.baseAsset] += 1;

          if (pumpCheck[data.baseAsset] >= pumpThreshold) {
            notify(`<b>${message} is being pumped!</b>`)
          }
        }

        message += ` INCREASED`;
      } else if (data.eventType === "DOWN_1") {
        if (data.period === "MINUTE_5") {
          pumpCheck[data.baseAsset] -= 1;
        } else if (data.period === "HOUR_2") {
          pumpCheck[data.baseAsset] -= 2;
        }
        message += ` DECREASED`;
      }

      message += ` ${changeInPercentage} within ${periodStr}.`;
      noti = true;
    } else {

      if (['RISE_AGAIN','DROP_BACK'].includes(data.eventType)) {
        if (data.eventType === 'RISE_AGAIN') {
          message += ` is rising again`
        } else if (data.eventType === 'DROP_BACK') {
          message += ` is dropping back`
          pumpCheck[data.baseAsset] = 0;
        }

        message += ` (${changeInPercentage} in ${periodStr}).`
        noti = true;

      } else if (['UP_BREAKTHROUGH', 'DOWN_BREAKTHROUGH'].includes(data.eventType)) {

        const stateStr = data.eventType === 'UP_BREAKTHROUGH' ? 'HIGH' : 'LOW';

        message += ` have a new ${periodStr} ${stateStr} (${changeInPercentage}).`;
        noti = true
      }
    }

    if (noti === true) {
      let price = 0;
      try {
        price = await getPrice(data.symbol);
        price = `<a href='https://www.binance.com/en/trade/${data.baseAsset}_USDT?layout=pro'>${price}</a>`;
      } catch (err) {
        price = "not available"
        logError(err)
      }

      message += ` Current price is ${price}.`;
      notify(message);
    }
  })

  socket.onerror = function(e) {
    logError(e);
  }

  socket.onclose = function (e) {
    logError(e);
    setTimeout(() => monitorAbnormalTradingNotices(), 0)
  }
}

monitorAbnormalTradingNotices();


// Pull-back, Rally, new xxx high, new xxx low, in 5 min, in 2 hours

// const dataSet = {
//   noticeType: 'PRICE_CHANGE', // PRICE_FLUCTUATION, PRICE_BREAKTHROUGH
//   eventType: 'UP_1', // DOWN_1, DROP_BACK (Pullback), RISE_AGAIN (Rally), UP_BREAKTHROUGH (new high), DOWN_BREAKTHROUGH (new low)
//   period: 'MINUTE_5', // HOUR_2, DAY_1, WEEK_1, MONTH_1, YEAR_1
//   priceChange: 0.03530751,
//   baseAsset: 'FARM',
//   quotaAsset: 'BTC'
// }

// id: 5426,
// name: "Solana",
// symbol: "SOL",
// slug: "solana",
// is_active: 1,
// status: "active",
// first_historical_data: "2020-04-10T04:59:18.000Z",
// last_historical_data: "2021-08-29T15:09:20.000Z",
// rank: 9