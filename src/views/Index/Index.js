import './Index.css'
import React, { useState} from 'react'

import WatchTable from './WatchTable/WatchTable'
import HoldTable from './HoldTable/HoldTable'

import { Button, Input, Divider, Modal, Alert } from 'antd'
import { ShareAltOutlined } from '@ant-design/icons'

import { makeHashParams, isUsingHash } from 'utils/hashParams'

import { useSelector } from 'react-redux'
import { selectListWatch } from './WatchTable/watchListSlice'
import { selectListHold } from './HoldTable/holdListSlice'

import Argg from 'assets/img/argg.gif'
import DogeJump from 'assets/img/DogeJump.gif'

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
        <h1>Binance Holder App <img src={DogeJump} alt="DogeJump" style={{ maxWidth: '40px', paddingBottom: '10px' }} /></h1>
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
        <p>
          <Alert
            message="Warning"
            description="If you change your data (watch list / hold list), a new hash will be generated, so when you change the data please copy the new URL and share again"
            type="warning"
            showIcon
            closable
          />
        </p>
      </Modal>
      <div className="index-container">
        <h2>Watch List</h2>
        <WatchTable/>
        <Divider dashed={true} />
        <h2>Hold List</h2>
        <HoldTable />
        <div className="copyright">
          <p>[<a href="https://github.com/tuhuynh27/binance-app" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Github</a>]
            [<a href="https://github.com/tuhuynh27/binance-app/issues/new" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Report Bug</a>]</p>
          <p>&copy; 2021 Tu Huynh - Hold to dieee <img src={Argg} alt="Argg" style={{ maxWidth: '30px' }}/> </p>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(Index)
