import './Index.css'
import React, { useState, useReducer, useEffect } from 'react'

import { Button, Input, Table, Divider, List, Modal, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import { usePersistence } from 'utils/persistence'
import { getHashParams } from 'utils/hashParams'
import { reducer, buildInitialData } from './data'

const hashData = getHashParams()

function Index() {
  const watchStore = usePersistence('binance_listWatch')
  const holdStore = usePersistence('binance_listHold')

  const [listWatch, setListWatch] = useState(hashData.listWatch || watchStore.get() || ['BTC', 'ETH'])
  const initialData = buildInitialData(listWatch)
  const [state, dispatch] = useReducer(reducer, initialData, undefined)
  const [isAdding, setIsAdding] = useState(false)
  const [newPair, setNewPair] = useState(null)
  const [listHold, setListHold] = useState(hashData.listHold || holdStore.get() || [])
  const [isHoldAdding, setIsHoldAdding] = useState(false)
  const [holdPair, setHoldPair] = useState(null)
  const [holdPrice, setHoldPrice] = useState(null)
  const [holdAmount, setHoldAmount] = useState(null)
  const [shareToggle, setShareToggle] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)

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
      dispatch({ type: 'update', payload: { stream, price: data.p }})
    }
    socket.addEventListener('message', updateRealtime)
    return () => {
      socket.removeEventListener('message', updateRealtime)
    }
  }, [listWatch, dispatch])

  function handleAddWatch() {
    if (!newPair || !newPair.length) {
      return
    }
    setListWatch(state => [
      ...state,
      newPair.toUpperCase()
    ])
    watchStore.set([...listWatch, newPair.toUpperCase()])
    setNewPair(null)
    setIsAdding(state => !state)
  }

  function handleDeleteWatch(stream) {
    setListWatch(state => state.filter(e => e !== stream))
    dispatch({ type: 'delete', payload: { pair: stream } })
    watchStore.set(listWatch.filter(e => e !== stream))
  }

  function handleAddHold() {
    if (!holdPair || !holdPrice || !holdAmount) {
      return
    }
    const newHold = {
      pair: holdPair.toUpperCase(),
      price: holdPrice,
      amount: holdAmount
    }
    setListHold(state => [
      ...state,
      newHold
    ])
    holdStore.set([...listHold, newHold])
    setHoldPair(null)
    setHoldPrice(null)
    setHoldAmount(null)
    setIsHoldAdding(false)
  }

  function handleDeleteHold(pair) {
    setListHold(state => state.filter(e => e.pair !== pair))
    holdStore.set(listHold.filter(e => e.pair !== pair))
  }

  function shareYourList() {
    const shareStr = JSON.stringify({
      listHold,
      listWatch
    })
    const shareUrl = `${window.location.origin}/#data=${shareStr}`
    setShareUrl(shareUrl)
    setShareToggle(state => !state)
  }

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl.toString())
    setShareToggle(state => !state)
  }

  return (
    <React.Fragment>
      <div className="index-header">
        <Button type="primary" onClick={shareYourList}>Share your list</Button>
      </div>
      <Modal title="Share your list" visible={shareToggle}
             onOk={() => { copyShareUrl().then(() => setShareToggle(false)); }}
             okText="Copy to clipboard"
             onCancel={() => setShareToggle(false)}>
        <p>You can share your list to your friends by sending them this URL</p>
        <p><Input value={shareUrl} /></p>
      </Modal>
      <div className="index-container">
        <h2>Watch List</h2>
        <p><Button type={isAdding ? 'default' : 'primary'} onClick={() => {setIsAdding(state => !state)}}>{ isAdding ? 'Cancel' : 'Add'}</Button></p>
        {isAdding && <p><Input value={newPair} onChange={e => setNewPair(e.target.value)} onPressEnter={handleAddWatch} placeholder="Enter to add"/></p>}
        <Table size="middle" rowKey="stream" columns={columns} dataSource={state} />
        <Divider dashed={true} />
        <h2>Hold List</h2>
        <p><Button type="primary" onClick={() => setIsHoldAdding(true)} style={{ marginBottom: '10px' }}>Add</Button></p>
        <List
          size="default"
          bordered
          dataSource={listHold}
          renderItem={item =>
            <List.Item>
              Holding {item.amount} {item.pair} at {item.price} USDT
              <Popconfirm
                title="Are you sure?"
                onConfirm={() => handleDeleteHold(item.pair)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" style={{ marginLeft: '0.5rem' }}>Sold</Button>
              </Popconfirm>
            </List.Item>}
        />
        <Modal title="Add item to hold list" visible={isHoldAdding} onOk={handleAddHold} onCancel={() => setIsHoldAdding(false)}>
          {!holdPair && <p>Please enter what you are holding</p>}
          {holdPair && <p>Preview: Holding {holdAmount || 0} {holdPair.toUpperCase()} at {holdPrice || 0} USDT</p>}
          <p><Input value={holdPair} onChange={e => setHoldPair(e.target.value)} placeholder="Name (eg: BTC)"/></p>
          <p><Input value={holdPrice} onChange={e => setHoldPrice(e.target.value)} placeholder="Price"/></p>
          <p><Input value={holdAmount} onChange={e => setHoldAmount(e.target.value)} placeholder="Amount"/></p>
        </Modal>
      </div>
    </React.Fragment>
  )
}

export default Index
