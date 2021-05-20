import './Watcher.css'
import React, { useState, useEffect } from 'react'

import { Table, Button, Input, notification } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

function Watcher() {
  const [tableData, setTableData] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    void getData()
  }, [])

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold'
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDelete(record.name)} icon={<DeleteOutlined />} />
      ),
    }
  ]

  async function getData() {
    const resp = await fetch('https://binance-watcher.tuhuynh.com/list')
    const data = await resp.json()
    setTableData(data.listWatch)
  }

  function handleAdd() {
    if (!text) return
    const textArr = text.split(' ')
    if (textArr.length < 2) return
    const newItem = {
      name: textArr[0].toUpperCase(),
      threshold: parseFloat(textArr[1])
    }
    if (tableData.find(e => e.name === newItem.name)) {
      setTableData(table => table.map(e => {
        if (e.name === newItem.name) {
          return {
            name: e.name,
            threshold: newItem.threshold
          }
        }
        return e
      }))
    } else {
      setTableData(table => [
        ...table,
        newItem
      ])
    }
    setText('')
  }

  function handleDelete(name) {
    setTableData(table => table.filter(e => e.name !== name))
  }

  async function submitData() {
    await fetch('https://binance-watcher.tuhuynh.com/setup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listWatch: tableData })
    })

    notification.success({
      message: 'Success',
      description: 'Done',
    })
  }

  return (
    <React.Fragment>
      <div className="watcher-container">
        <h1>Watcher</h1>
        <Button onClick={() => setIsAdding(s => !s)} type={isAdding ? 'default' : 'primary'} style={{ marginBottom: '20px' }}>{isAdding ? 'Cancel' : 'Add/Update'}</Button>
        {isAdding && <Input
          value={text} onChange={e => setText(e.target.value)}
          onPressEnter={handleAdd}
          style={{ marginBottom: '20px' }} placeholder="ETH 0.1" />}
        <Table
          pagination={{ position: ['none', 'none'] }}
          size="large" rowKey="name" columns={columns} dataSource={tableData}
          style={{ marginBottom: '20px' }} />
        <Button onClick={submitData}>Submit Data</Button>
      </div>
    </React.Fragment>
  )
}

export default Watcher
