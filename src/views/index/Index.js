import React, { useState, useReducer, useEffect } from 'react'

import { Button, Input, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

function reducer(state, action) {
  switch(action.type) {
    case 'update':
      const { stream, price } = action.payload
      const isExisted = state.find(e => e.stream === stream)
      if (!isExisted) {
        return [
          ...state,
          {
            stream,
            pair: stream.slice(0, -13).toUpperCase(),
            price
          }
        ]
      }
      return state.map(e =>{
        if (e.stream !== stream) {
          return e
        }
        return {
          ...e,
          price
        }
      })
    case 'delete':
      const { pair } = action.payload
      return state.filter(e => e.pair !== pair)
    default:
      throw new Error()
  }
}

function buildInitialData(listCoin = []) {
  return listCoin.map(e => ({
    stream: `${e.toLowerCase()}usdt@aggTrade`,
    pair: e,
    price: 0
  }))
}

function Index() {
  const columns = [
    {
      title: 'Pair',
      dataIndex: 'pair',
      key: 'pair',
      render: (val) => `${val} / USDT`
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDelete(record.pair)} icon={<DeleteOutlined />} />
      ),
    },
  ]

  const [listCoin, setListCoin] = useState(['BTC', 'ETH', 'SHIB'])
  const initialData = buildInitialData(listCoin)
  const [state, dispatch] = useReducer(reducer, initialData)
  const [isAdding, setIsAdding] = useState(false)
  const [newPair, setNewPair] = useState('')

  useEffect(() => {
    const listCoinStream = listCoin.map(e =>`${e.toLowerCase()}usdt@aggTrade`)
    const connectStr = listCoinStream.join('/')
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + connectStr)
    function updateRealtime(e) {
      const payload = JSON.parse(e.data)
      const { stream, data } = payload
      dispatch({ type: 'update', payload: { stream, price: data.p }})
    }
    socket.addEventListener('message', updateRealtime)
    return () => {
      socket.removeEventListener('message', updateRealtime)
    }
  }, [listCoin, dispatch])

  function handleChange(e) {
    setNewPair(e.target.value)
  }

  function handleAdd() {
    setListCoin(state => [
      ...state,
      newPair
    ])
    setNewPair('')
    setIsAdding(state => !state)
  }

  function handleDelete(stream) {
    setListCoin(state => state.filter(e => e !== stream))
    dispatch({ type: 'delete', payload: { pair: stream } })
  }

  return (
    <React.Fragment>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '10px' }}>Watch List</h2>
        <Button type={isAdding ? 'default' : 'primary'} onClick={() => {setIsAdding(state => !state)}} style={{ marginBottom: '10px' }}>{ isAdding ? 'Cancel' : 'Add'}</Button>
        {isAdding && <Input value={newPair} onChange={handleChange} onPressEnter={handleAdd} placeholder="Enter to add" style={{ marginBottom: '10px' }}/>}
        <Table size="middle" rowKey="stream" columns={columns} dataSource={state} />
      </div>
    </React.Fragment>
  )
}

export default Index
