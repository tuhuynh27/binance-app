import './App.css'
import React, { useState } from 'react'

import { Layout, Drawer } from 'antd'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import Index from './views/Index/Index'
import Watcher from './views/Watcher/Watcher'

import Logo from 'assets/img/logo.png'
import DrawerIcon from 'assets/img/drawer.png'

const { Header, Content, Footer } = Layout

function App() {
  const [drawerVisible, setDrawerVisible] = useState(false)

  function onDrawerClose() {
    setDrawerVisible(false)
  }

  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <img className="logo" src={Logo} alt="Logo" />
        <img className="drawer" src={DrawerIcon} alt="Drawer" onClick={() => setDrawerVisible(true)} />
      </Header>
      <Drawer
        title="Menu"
        placement="right"
        closable={false}
        onClose={onDrawerClose}
        visible={drawerVisible}>
        <p>This feature is developing</p>
      </Drawer>
      <Content className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: '85vh' }}>
          <Router>
            <Switch>
              <Route exact path="/">
                <Index />
              </Route>
              <Route exact patch="/watcher">
                <Watcher />
              </Route>
            </Switch>
        </Router>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <p><a href="https://github.com/tuhuynh27/binance-app" target="_blank" rel="noreferrer" style={{ color: 'white' }}>Github</a>
          {' - '}
          <a href="https://github.com/tuhuynh27/binance-app/issues/new" target="_blank" rel="noreferrer" style={{ color: 'white' }}>Report Bug</a></p>
        <p style={{ fontSize: '40px' }}>HODL</p>
      </Footer>
    </Layout>
  )
}

export default React.memo(App)
