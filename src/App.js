import './App.css'
import React, { useState } from 'react'

import { Layout, Drawer } from 'antd'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import Index from './views/Index/Index'

import Argg from 'assets/img/argg.gif'
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
        <p>This feature is dev</p>
      </Drawer>
      <Content className="site-layout">
        <div className="site-layout-background" style={{ padding: 24, minHeight: '85vh' }}>
          <Router>
            <Switch>
              <Route exact path="/">
                <Index />
              </Route>
            </Switch>
        </Router>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        <p>[<a href="https://github.com/tuhuynh27/binance-app" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Github</a>]
          [<a href="https://github.com/tuhuynh27/binance-app/issues/new" target="_blank" rel="noreferrer" style={{ color: 'black' }}>Report Bug</a>]</p>
        <p>&copy; 2021 Tu Huynh - Hold to dieee <img src={Argg} alt="Argg" style={{ maxWidth: '30px' }}/> </p>
      </Footer>
    </Layout>
  )
}

export default React.memo(App)
