import React, { useState } from 'react'

import { Button, Input, List, Modal, Popconfirm, Statistic, message } from 'antd'

import { useDispatch, useSelector } from 'react-redux'
import { selectListHold, addHoldItem, deleteHoldItem } from './holdListSlice'

import { isUsingHash } from 'utils/hashParams'

function HoldTable() {
  const listHold = useSelector(selectListHold)
  const dispatch = useDispatch()

  const [isHoldAdding, setIsHoldAdding] = useState(false)
  const [holdPair, setHoldPair] = useState(null)
  const [holdPrice, setHoldPrice] = useState(null)
  const [holdAmount, setHoldAmount] = useState(null)

  function handleAddHold() {
    if (!holdPair || !holdPrice || !holdAmount) {
      return
    }
    const newHold = {
      pair: holdPair.toUpperCase(),
      price: holdPrice,
      amount: holdAmount
    }
    dispatch(addHoldItem(newHold))
    setHoldPair(null)
    setHoldPrice(null)
    setHoldAmount(null)
    setIsHoldAdding(false)
  }

  function handleDeleteHold(pair) {
    dispatch(deleteHoldItem({ pair }))
  }

  function calcHoldingBalance() {
    return listHold.reduce((accumulator, e) => accumulator + (e.amount * e.price), 0)
  }

  return (
    <React.Fragment>
      {!isUsingHash.check &&
        <p>
          <Button type="primary" onClick={() => setIsHoldAdding(true)} style={{ marginBottom: '10px' }}>Add</Button>
          <Button
            type="default" style={{ marginBottom: '10px', marginLeft: '10px' }}
            onClick={() => message.error('API Key not found, please attach Binance API Key')}>
            Import data via Binance API Key
          </Button>
        </p>}
      <List
        size="default"
        bordered
        dataSource={listHold}
        rowKey={(item) => item.pair + item.amount + item.price}
        renderItem={item =>
          <List.Item>
            Holding {item.amount} {item.pair} at {item.price} USDT
            {!isUsingHash.check && <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDeleteHold(item.pair)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" style={{ marginLeft: '0.5rem' }}>Sold</Button>
            </Popconfirm>}
          </List.Item>}
        header={<Statistic title="Holding Balance (USDT)" value={calcHoldingBalance()} precision={2} />}
      />
      <Modal title="Add item to hold list" visible={isHoldAdding} onOk={handleAddHold} onCancel={() => setIsHoldAdding(false)}>
        {!holdPair && <p>Please enter what you are holding</p>}
        {holdPair && <p>Preview: Holding {holdAmount || 0} {holdPair.toUpperCase()} at {holdPrice || 0} USDT</p>}
        <p><Input value={holdPair} onChange={e => setHoldPair(e.target.value)} placeholder="Name (eg: BTC)" allowClear/></p>
        <p><Input value={holdPrice} onChange={e => setHoldPrice(e.target.value)} placeholder="Price" prefix="$" suffix="USDT" allowClear/></p>
        <p><Input value={holdAmount} onChange={e => setHoldAmount(e.target.value)} placeholder="Amount" allowClear/></p>
      </Modal>
    </React.Fragment>
  )
}

export default React.memo(HoldTable)
