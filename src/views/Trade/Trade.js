import './Trade.css'
import React, { useState, useEffect, useCallback } from 'react'

import { Spin, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function Trade() {
  const [logs, setLogs] = useState([])
  const [rate, setRate] = useState({})
  const [info, setInfo] = useState({})
  const [configs, setConfigs] = useState({})

  const loadData = useCallback(async () => {
    const allPromises = [getInfo(), getLogs(), getRate(), getConfig()]
    await Promise.allSettled(allPromises)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [loadData])

  async function getInfo() {
    try {
      const resp = await fetch('https://trade.tuhuynh.com/trade/info/get')
      const data = await resp.json()
      setInfo(data)
    } catch(err) {
      console.log(err)
    }
  }

  async function getLogs() {
    try {
      const resp = await fetch('https://trade.tuhuynh.com/trade/logs/get')
      const data = await resp.json()
      data.reverse()
      setLogs(data)
    } catch(err) {
      console.log(err)
    }
  }

  async function getRate() {
    try {
      const resp = await fetch('https://trade.tuhuynh.com/trade/logs/rate')
      const data = await resp.json()
      setRate(data)
    } catch(err) {
      console.log(err)
    }
  }

  async function getConfig() {
    try {
      const resp = await fetch('https://trade.tuhuynh.com/trade/config/get')
      const data = await resp.json()
      setConfigs(data)
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <React.Fragment>
      <div className="trade-container">
        <h1>Trade Bot Battle <Spin style={{ marginLeft: '20px' }} indicator={antIcon} /></h1>
        <div>
          <p>Funds: {info.initialBalance} USDT</p>
          <p>Transactions: {info.txCount}</p>
          <p>Win/Lose: {rate.win} / {rate.lose} (Rate: {(rate.win / (rate.win + rate.lose)).toFixed(2)}%)</p>
          <p>Profit: <strong>{info.profit ? info.profit.toFixed(2) : 0}</strong> USDT (<strong>{(info.profit / info.initialBalance * 100).toFixed(2)}</strong>%)</p>
          <p>Market status: Neutral</p>
          <p>Auto adjust algorithm: Disabled</p>
          <p>Configs <Button size="small" style={{ marginLeft: '5px' }}>Update</Button></p>
          <ul>
            <li>Dip Threshold: {configs.dipDownThreshold}%</li>
            <li>Up Trend Threshold: {configs.dipUpThreshold}%</li>
            <li>Deny Dip: {configs.denyDipDown}%</li>
            <li>Start To Buy: {configs.startToBuy}%</li>
            <li>Stop Loss: {configs.stopLoss}%</li>
            <li>Take Profit: {configs.takeProfit}%</li>
          </ul>
        </div>
        <div className="log-table">
          {logs.map((l, i) => {
            let status = 'black'
            if (l.startsWith('Stop loss ')) {
              status = 'red'
            } else if (l.startsWith('Take profit ')) {
              status = 'green'
            }
            return (<p key={i} style={{ color: status, fontWeight: status === 'red' || status === 'green' ? 'bold' : 'normal' }}>{l}</p>)
          })}
        </div>
      </div>
      <div className="trade-container" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a style={{ fontWeight: 'bold', color: 'green'}} href="https://github.com/tuhuynh27/trade-bot" target="_blank" rel="noreferrer">
            Trade Engine</a> &copy; 2021 Tu Huynh
        </div>
      </div>
    </React.Fragment>
  )
}

export default Trade
