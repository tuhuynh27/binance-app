import React, { useState } from 'react'

import { Button, Input, Modal, notification } from 'antd'

import { setListHold } from './holdListSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectListWatch } from '../WatchTable/watchListSlice'

import * as persistence from 'utils/persistence'

import BinanceAPIKeySetupImg from 'assets/img/binance.jpg'

function Import() {
  const listWatch = useSelector(selectListWatch)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState(null)
  const [apiSecret, setApiSecret] = useState(null)
  const [serverUrl, setServerUrl] = useState('https://binance-server.tuhuynh.com')
  const [canDelete, setCanDelete] = useState(!!persistence.get('binance_apiKey'))

  async function importDataBinance() {
    try {
      setLoading(true)
      const holdings = await getHolding(listWatch)
      dispatch(setListHold(holdings))
      notification.success({
        message: 'Success',
        description: `Imported holding data for ${listWatch.join(', ')}, if you want to see more holding assets, please add more in watch list and then click import again`,
      })
    } catch (err) {
      notification.error({
        message: 'Error when calling server',
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  async function getHolding(symbols) {
    const apiKey = persistence.get('binance_apiKey')
    const apiSecret = persistence.get('binance_apiSecret')
    const serverUrl = persistence.get('binance_serverUrl')
    const resp = await fetch(serverUrl + '/holding', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbols, apiKey, apiSecret })
    })
    const result = await resp.json()
    if (result.err) {
      throw new Error(result.err)
    }
    return result.filter(e => e.amount > 0)
  }

  function handleImport() {
    const apiKey = persistence.get('binance_apiKey')
    const apiSecret = persistence.get('binance_apiSecret')
    if (!apiKey || !apiSecret) {
      setIsModalOpen(true)
    } else {
      void importDataBinance()
    }
  }

  function handleSave() {
    if (!apiKey || !apiSecret || !serverUrl) {
      return
    }

    persistence.set('binance_apiKey', apiKey)
    persistence.set('binance_apiSecret', apiSecret)
    persistence.set('binance_serverUrl', serverUrl)

    setIsModalOpen(false)

    notification.success({
      message: 'Success',
      description: 'Done setup Binance API Key, you can now import holding data',
    })

    setCanDelete(true)
  }

  function handleDelete() {
    persistence.set('binance_apiKey', null)
    persistence.set('binance_apiSecret', null)
    persistence.set('binance_serverUrl', null)

    notification.success({
      message: 'Delete Success',
      description: 'You can now setup Binance API Key again',
    })

    setCanDelete(false)
  }

  return (
    <React.Fragment>
      <Button
        type="default" style={{ marginBottom: '10px', marginLeft: '10px' }}
        loading={loading}
        onClick={handleImport}>
        Import data via Binance API Key
      </Button>
      {canDelete && <Button
        type="dashed" style={{ marginBottom: '10px', marginLeft: '10px' }}
        onClick={handleDelete}>
        Delete API Key
      </Button>}
      <Modal title="Enter Binance API Key" visible={isModalOpen} onOk={handleSave} onCancel={() => setIsModalOpen(false)}>
        <p>Please visit <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noreferrer">here</a> to setup Binance API. After created API, please <strong>only Enable Reading</strong> as show below.</p>
        <p style={{ textAlign: 'center' }}><img src={BinanceAPIKeySetupImg} style={{ maxWidth: '75%' }} alt="Setup Guide"/></p>
        <p><Input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API Key" allowClear/></p>
        <p><Input.Password value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="API Secret" allowClear/></p>
        <p><Input value={serverUrl} onChange={e => setServerUrl(e.target.value)} placeholder="Server URL" allowClear/></p>
        <p>If you want to use your self-host server, please <a href="https://github.com/tuhuynh27/binance-app/tree/master/server" target="_blank" rel="noreferrer">refer this</a> repository for server deployment.</p>
      </Modal>
    </React.Fragment>
  )
}

export default React.memo(Import)
