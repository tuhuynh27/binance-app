import './Index.css'
import React, { useState} from 'react'

import WatchTable from './WatchTable/WatchTable'
import HoldTable from './HoldTable/HoldTable'

import { Button, Input, Divider, Modal } from 'antd'

import { makeHashParams } from 'utils/hashParams'

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
        <WatchTable/>
        <Divider dashed={true} />
        <h2>Hold List</h2>
        <HoldTable />
      </div>
    </React.Fragment>
  )
}

export default React.memo(Index)
