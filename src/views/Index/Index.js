import './Index.css'
import React, { useState} from 'react'

import WatchTable from './WatchTable/WatchTable'
import HoldTable from './HoldTable/HoldTable'

import { Button, Input, Divider, Modal } from 'antd'
import { ShareAltOutlined } from '@ant-design/icons'

import { makeHashParams, isUsingHash } from 'utils/hashParams'

import { useSelector } from 'react-redux'
import { selectListWatch } from './WatchTable/watchListSlice'
import { selectListHold } from './HoldTable/holdListSlice'

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

  return (
    <React.Fragment>
      <div>
        <h1>Binance App</h1>
      </div>
      <div className="index-header">
        {!isUsingHash.check && <Button type="primary" size="large" icon={<ShareAltOutlined />} onClick={shareYourList}>Share your list</Button>}
        {isUsingHash.check && <Button type="primary" size="large" onClick={createYourList}>Create your own list</Button>}
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
        <WatchTable/>
        <Divider dashed={true} />
        <h2>Hold List</h2>
        <HoldTable />
        <div className="copyright">
          [<a href="https://github.com/tuhuynh27/binance-app" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Github</a>]
          [<a href="https://tuhuynh.com" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Homepage</a>]
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(Index)
