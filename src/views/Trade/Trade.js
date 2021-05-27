import './Trade.css'
import React, { useState, useEffect, useCallback } from 'react'

import { Spin, Button, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'

import dayjs from 'dayjs'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function Trade() {
  const [logs, setLogs] = useState([])
  const [rate, setRate] = useState({})
  const [info, setInfo] = useState({})
  const [configs, setConfigs] = useState({})
  const [filterInput, setFilterInput] = useState('')
  const [filter, setFilter] = useState([])

  const loadData = useCallback(async () => {
    const allPromises = [getInfo(), getLogs(), getRate(), getConfig()]
    await Promise.allSettled(allPromises)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
    }, 1000)

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
      setLogs(oldData => {
        const newItems = data.filter(e => !oldData.find(x => x.time === e.time))
        return data.map(e => newItems.find(x => x.time === e.time) ? { ...e, isNew: true } : e)
      })
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

  function calcTxPerSecond() {
    if (!info.startTime || !info.txCount) return 0
    const sec = (new Date().getTime() - info.startTime - 10000) / 1000
    return (info.txCount / sec * 3).toFixed(2)
  }

  function changeFilterInput(e) {
    const val = e.target.value
    setFilterInput(val)
    if (!val || !val.length) {
      setFilter([])
      return
    }

    if (!val.length) return
    const vals = val.split(',')
    setFilter(vals)
  }

  return (
    <React.Fragment>
      <div className="trade-container">
        <h1>Trade Bot Battle <Spin style={{ marginLeft: '20px' }} indicator={antIcon} /></h1>
        <div>
          <p>Funds: {info.initialBalance || 0} USDT</p>
          <p>Transactions: {info.txCount || 0} ({calcTxPerSecond()} transactions/s)</p>
          <p>Win/Lose: {rate.win || 0} / {rate.lose || 0} (Win rate: {(rate.win / (rate.win + rate.lose) * 100).toFixed(2)}%)</p>
          <p>Profit: <strong>{info.profit ? info.profit.toFixed(2) * -1 : 0}</strong> USDT (<strong>{(info.profit / info.initialBalance * 100).toFixed(2) * -1}</strong>%)</p>
          <p>Market status: <span style={{ fontWeight: 'bold', color: 'red' }}>Downtrend</span></p>
          <p>Auto adjust algorithm: Disabled</p>
          <p>Configs <Button size="small" style={{ marginLeft: '5px' }}>Update</Button></p>
          <ul>
            <li>Down Threshold: {configs.downThreshold || 0}%</li>
            <li>Up Threshold: {configs.upThreshold || 0}%</li>
            <li>Deny Threshold: {configs.denyThreshold || 0}%</li>
            <li>Buy Point: {configs.buyPoint || 0}%</li>
            <li>Stop Loss: {configs.stopLoss|| 0}%</li>
            <li>Take Profit: {configs.takeProfit || 0}%</li>
          </ul>
        </div>
        <div>
          <Input
            value={filterInput}
            onChange={changeFilterInput}
            placeholder="Filter currency log by name, EG: BTC,ETH" style={{ marginBottom: '20px' }}/>
        </div>
        <div className="log-table">
          {logs.filter(e => {
            if (!filter || !filter.length) {
              return e
            }
            return filter.includes(e.currency)
          }).map((e, i) => {
            const l = e.msg
            let status = 'black'
            if (l.startsWith('Stop loss ')) {
              status = 'red'
            } else if (l.startsWith('Take profit ')) {
              status = 'green'
            }
            const time = dayjs(e.time).format('HH:mm:ss')
            return (
              <p key={i} style={{ color: status, background: e.isNew ? '#ffff99' : 'white', fontWeight: status === 'red' || status === 'green' ? 'bold' : 'normal' }}>
                [{time}] {l}
              </p>)
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
