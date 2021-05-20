import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Button, Input, Table, Spin } from 'antd'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'

import { selectTableData, selectListWatch, addWatchItem, updateTableData, updateMetadata, removeWatchItem } from './watchListSlice'
import { selectListHold } from '../HoldTable/holdListSlice'

import { isUsingHash } from 'utils/hashParams'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function WatchTable() {
  const tableData = useSelector(selectTableData)
  const listWatch = useSelector(selectListWatch)
  const listHold = useSelector(selectListHold)
  const dispatch = useDispatch()

  const [isAdding, setIsAdding] = useState(false)
  const [newPair, setNewPair] = useState(null)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'pair',
      key: 'pair',
      render: (_, record) => (
        <a href={`https://www.binance.com/en/trade/${record.pair}_USDT?type=spot`} target="_blank" rel="noreferrer" style={{ color: 'black' }}>
          <span style={{ fontWeight: 400, fontSize: '18px' }}>{record.pair}</span>
        </a>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => {
        return (
          <React.Fragment>
            {record.price || <Spin indicator={antIcon} />}
          </React.Fragment>
        )
      }
    },
    {
      title: 'PNL (%)',
      render: (_, record) => {
        const pickedList = listHold.filter(e => e.pair === record.pair)
        const list = pickedList.map(picked => {
          const value = (record.price / picked.price * 100 - 100).toFixed(2)
          return (
            <div style={{ fontWeight: 'bold', color: value >= 0 ? 'green' : 'red' }} key={picked.price.toString() + picked.amount.toString()}>
              {value}%
            </div>
          )
        })
        return (
          <React.Fragment>
            {list.length ? list : '--'}
          </React.Fragment>
        )
      },
      responsive: ['md']
    },
    {
      title: 'PNL ($)',
      render: (_, record) => {
        const pickedList = listHold.filter(e => e.pair === record.pair)
        const list = pickedList.map(picked => {
          const value = ((picked.price * picked.amount) * ((record.price / picked.price * 100 - 100) / 100)).toFixed(2)
          return (
            <div style={{ fontWeight: 'bold', color: value >= 0 ? 'green' : 'red' }} key={picked.price.toString() + picked.amount.toString()}>
              {value}
            </div>
          )
        })
        return (
          <React.Fragment>
            {list.length ? list : '--'}
          </React.Fragment>
        )
      }
    },
    {
      title: '24h Change',
      dataIndex: 'highLow',
      key: 'highLow',
      sorter: (a, b) => parseFloat(a.change) - parseFloat(b.change),
      render: (_, record) => {
        if (!record.change) {
          return (
            <Spin indicator={antIcon} />
          )
        }
        return (
          <React.Fragment>
          <div>High: {record.high || 0}</div>
          <div>Low: {record.low || 0}</div>
          <div>Change: <span style={{ fontWeight: 'bold', color: record.change >= 0 ? 'green' : 'red' }}>{record.change || 0}%</span></div>
        </React.Fragment>
        )
      },
      responsive: ['md']
    },
    {
      title: '24h Volume ($)',
      dataIndex: 'volume',
      key: 'volume',
      sorter: (a, b) => parseFloat(a.volume) - parseFloat(b.volume),
      render: (_, record) => {
        if (!record.volume) {
          return (
            <Spin indicator={antIcon} />
          )
        }
        const avg = (parseFloat(record.high) + parseFloat(record.low)) / 2
        const val = (parseFloat(record.volume) * avg).toFixed(0)
        const result = (val / 1000000).toFixed(2)
        return (
          <React.Fragment>{result ? '~' + result + 'M' : 0}</React.Fragment>
        )
      },
      responsive: ['md']
    },
    ...!isUsingHash.check ? [{
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDeleteWatch(record.pair)} icon={<DeleteOutlined />} />
      ),
    }] : []
  ]

  useEffect(() => {
    const listWatchStream = listWatch.map(e =>`${e.toLowerCase()}usdt@aggTrade`)
    const connectStr = listWatchStream.join('/')
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + connectStr)
    function updateRealtime(e) {
      const payload = JSON.parse(e.data)
      const { stream, data } = payload
      const priceFloat = parseFloat(data.p)
      const price = priceFloat.toFixed(priceFloat > 1000 ? 2 : 6)
      dispatch(updateTableData({ stream, price }))
    }
    socket.addEventListener('message', updateRealtime)
    return () => {
      socket.removeEventListener('message', updateRealtime)
      socket.close()
    }
  }, [listWatch, dispatch])

  const loadMeta = useCallback(
    async () => {
      for (const e of listWatch) {
        const resp = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${e}USDT`)
        const data = await resp.json()
        const highPrice = parseFloat(data.highPrice)
        const lowPrice = parseFloat(data.lowPrice)
        const volume = parseFloat(data.volume)
        const change = parseFloat(data.priceChangePercent)
        dispatch(updateMetadata({
          stream: `${e.toLowerCase()}usdt@aggTrade`,
          highPrice: highPrice.toFixed(highPrice > 1000 ? 2 : 6),
          lowPrice: lowPrice.toFixed(highPrice > 1000 ? 2 : 6),
          volume: volume.toFixed(0),
          change: change.toFixed(2),
        }))
      }
    }, [listWatch, dispatch]
  )

  useEffect(() => {
    setTimeout(() => void loadMeta(), 1000)
    const interval = setInterval(() => {
      void loadMeta()
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [loadMeta])

  function handleAddWatch() {
    if (!newPair || !newPair.length) {
      return
    }
    dispatch(addWatchItem(newPair.toUpperCase()))
    setNewPair(null)
    setIsAdding(state => !state)
  }

  function handleDeleteWatch(pair) {
    dispatch(removeWatchItem({ pair }))
  }

  return (
    <React.Fragment>
      {!isUsingHash.check &&
        <div style={{ marginBottom: '20px' }}>
          <Button type={isAdding ? 'default' : 'primary'} onClick={() => {setIsAdding(state => !state)}}>
            { isAdding ? 'Cancel' : 'Add'}
          </Button>
        </div>}
      {isAdding &&
        <div style={{ marginBottom: '20px' }}>
          <Input value={newPair} onChange={e => setNewPair(e.target.value)} onPressEnter={handleAddWatch} placeholder="Enter to add"/>
        </div>}
      <Table
        pagination={{ position: ['none', 'none'] }}
        footer={() => {
          return (<div style={{ textAlign: 'center', cursor: 'pointer' }}>View more markets</div>)
        }}
        size="large" rowKey="stream" columns={columns} dataSource={tableData} />
    </React.Fragment>
  )
}

export default React.memo(WatchTable)
