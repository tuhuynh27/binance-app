import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Button, Input, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import { selectTableData, selectListWatch, addWatchItem, updateTableData, removeWatchItem } from './watchListSlice'
import { selectListHold } from '../HoldTable/holdListSlice'

function WatchTable() {
  const tableData = useSelector(selectTableData)
  const listWatch = useSelector(selectListWatch)
  const listHold = useSelector(selectListHold)
  const dispatch = useDispatch()

  const [isAdding, setIsAdding] = useState(false)
  const [newPair, setNewPair] = useState(null)

  const columns = [
    {
      title: 'Currency',
      dataIndex: 'pair',
      key: 'pair',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'PNL (%)',
      render: (_, record) => {
        const picked = listHold.find(e => e.pair === record.pair)
        if (picked) {
          return (
            <span>{(record.price / picked.price * 100 - 100).toFixed(2)}%</span>
          )
        }
      }
    },
    {
      title: 'PNL ($)',
      render: (_, record) => {
        const picked = listHold.find(e => e.pair === record.pair)
        if (picked) {
          return (
            <span>{((picked.price * picked.amount) * ((record.price / picked.price * 100 - 100) / 100)).toFixed(2)}</span>
          )
        }
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDeleteWatch(record.pair)} icon={<DeleteOutlined />} />
      ),
    }
  ]

  useEffect(() => {
    const listWatchStream = listWatch.map(e =>`${e.toLowerCase()}usdt@aggTrade`)
    const connectStr = listWatchStream.join('/')
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + connectStr)
    function updateRealtime(e) {
      const payload = JSON.parse(e.data)
      const { stream, data } = payload
      dispatch(updateTableData({ stream, price: data.p }))
    }
    socket.addEventListener('message', updateRealtime)
    return () => {
      socket.removeEventListener('message', updateRealtime)
      socket.close()
    }
  }, [listWatch, dispatch])

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
      <p>
        <Button type={isAdding ? 'default' : 'primary'} onClick={() => {setIsAdding(state => !state)}}>
          { isAdding ? 'Cancel' : 'Add'}
        </Button>
      </p>
      {isAdding &&
        <p>
          <Input value={newPair} onChange={e => setNewPair(e.target.value)} onPressEnter={handleAddWatch} placeholder="Enter to add"/>
        </p>}
      <Table size="middle" rowKey="stream" columns={columns} dataSource={tableData} />
    </React.Fragment>
  )
}

export default React.memo(WatchTable)
