import './Index.css'
import React, { useState} from 'react'

import WatchTable from './WatchTable/WatchTable'
import HoldTable from './HoldTable/HoldTable'

import { Button, Input, Divider, Modal, Alert, Space } from 'antd'
import { ShareAltOutlined } from '@ant-design/icons'

import { makeHashParams, isUsingHash, getHashParams } from 'utils/hashParams'

import { useSelector } from 'react-redux'
import { selectListWatch } from './WatchTable/watchListSlice'
import { selectListHold } from './HoldTable/holdListSlice'

import * as persistence from 'utils/persistence'

function Index() {
  const [shareToggle, setShareToggle] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)

  const listWatch = useSelector(selectListWatch)
  const listHold = useSelector(selectListHold)

  function shareYourList() {
    const shareUrl = makeHashParams({
      listWatch,
      listHold,
    })
    setShareUrl(shareUrl)
    setShareToggle(state => !state)
  }

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl.toString())
    setShareToggle(state => !state)
  }

  function createYourList() {
    window.location.href = window.location.origin
  }

  function applyChanges() {
    const hashData = getHashParams()
    const { listWatch, listHold } = hashData
    persistence.set('binance_listWatch', listWatch)
    persistence.set('binance_listHold', listHold)
    window.history.replaceState(null, null, ' ')
    window.location.reload()
  }

  return (
    <React.Fragment>
      <Modal title="Share your list" visible={shareToggle}
             onOk={() => { copyShareUrl().then(() => setShareToggle(false)); }}
             okText="Copy to clipboard"
             onCancel={() => setShareToggle(false)}>
        <Space direction="vertical">
          <div>You can share your list to your friends by sending them this URL</div>
          <div><Input value={shareUrl} /></div>
          <div>
            <Alert
              message="Warning"
              description="If you change your data (watch list / hold list), a new hash will be generated, so when you change the data please copy the new URL and share again"
              type="warning"
              showIcon
              closable
            />
          </div>
        </Space>
      </Modal>
      <div className="index-container">
        <div className="index-header">
          {!isUsingHash.check && <Button size="large" icon={<ShareAltOutlined />} onClick={shareYourList}>Share your list</Button>}
          {isUsingHash.check && <Button size="large" onClick={createYourList}>Create your own list</Button>}
          {isUsingHash.check && <Button size="large" type="primary" onClick={applyChanges} style={{ marginLeft: '1rem' }}>Apply this list</Button>}
        </div>
        <h1>Watch List</h1>
        <WatchTable/>
        <Divider dashed={true} />
        <h1>Hold List</h1>
        <HoldTable />
      </div>
    </React.Fragment>
  )
}

export default React.memo(Index)
