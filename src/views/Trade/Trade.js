import './Trade.css'
import React, { useState, useEffect, useCallback } from 'react'

import { Input, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'

const { TextArea } = Input;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function Trade() {
  const [logs, setLogs] = useState([])
  const [rate, setRate] = useState({})
  const [info, setInfo] = useState({})
  const [configs, setConfigs] = useState({})
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    await getInfo()
    await getLogs()
    await getRate()
    await getConfig()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [loadData])

  async function getInfo() {
    try {
      setLoading(true)
      const resp = await fetch('https://trade.tuhuynh.com/trade/info/get')
      const data = await resp.json()
      setInfo(data)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  async function getLogs() {
    try {
      setLoading(true)
      const resp = await fetch('https://trade.tuhuynh.com/trade/logs/get')
      const data = await resp.json()
      data.reverse()
      setLogs(data)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  async function getRate() {
    try {
      setLoading(true)
      const resp = await fetch('https://trade.tuhuynh.com/trade/logs/rate')
      const data = await resp.json()
      setRate(data)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  async function getConfig() {
    try {
      setLoading(true)
      const resp = await fetch('https://trade.tuhuynh.com/trade/config/get')
      const data = await resp.json()
      setConfigs(data)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <React.Fragment>
      <div className="trade-container">
        <h1>Trade Bot <Spin style={{ marginLeft: '20px' }} indicator={antIcon} /></h1>
        <Spin spinning={loading} delay={1000}>
          <div>
            <p>Funds: {info.initialBalance} USDT</p>
            <p>Transactions: {info.txCount}</p>
            <p>Win/Lose: {rate.win} / {rate.lose}</p>
            <p>Profit: <strong>{info.profit ? info.profit.toFixed(2) : 0}</strong> USDT (<strong>{(info.profit / info.initialBalance * 100).toFixed(2)}</strong>%)</p>
            <p>Configs:</p>
            <ul>
              <li>Dip Down Threshold: {configs.dipDownThreshold}%</li>
              <li>Up Trend Threshold: {configs.dipUpThreshold}%</li>
              <li>Deny Dip (Down): {configs.denyDipDown}%</li>
              <li>Start To Buy: {configs.startToBuy}%</li>
              <li>Stop Loss: {configs.stopLoss}%</li>
              <li>Take Profit: {configs.takeProfit}%</li>
            </ul>
          </div>
        </Spin>
        <TextArea value={logs.join('\n\n')} rows="12"></TextArea>
      </div>
    </React.Fragment>
  )
}

export default Trade
