import './App.css'
import React, { useState } from 'react'

import { Layout, Drawer } from 'antd'

import { LineChartOutlined, MonitorOutlined, RobotOutlined } from '@ant-design/icons'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

import Index from './views/Index/Index'
import Watcher from './views/Watcher/Watcher'
import Trade from './views/Trade/Trade'

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
      <Router>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%', color: 'white' }}>
          <Link to="/"><img className="logo" src={Logo} alt="Logo" /></Link>
          <img className="drawer" src={DrawerIcon} alt="Drawer" onClick={() => setDrawerVisible(true)} />
          <Link to="/" className="menu-item">Index</Link>
          <Link to="/watcher" className="menu-item">Watcher</Link>
          <Link to="/trade" className="menu-item">Trade</Link>
        </Header>
        <Drawer
          placement="right"
          width="232px"
          bodyStyle={{
            background: '#12161C',
            padding: '12px'
          }}
          closable={false}
          onClose={onDrawerClose}
          visible={drawerVisible}>
          <div className="mobile-menu-container">
            <div className="mobile-menu-item">
              <Link onClick={onDrawerClose} to="/"><LineChartOutlined /> Index</Link>
            </div>
            <div className="mobile-menu-item">
              <Link onClick={onDrawerClose} to ="/watcher"><MonitorOutlined /> Watcher</Link>
            </div>
            <div className="mobile-menu-item">
              <Link onClick={onDrawerClose} to ="/trade"><RobotOutlined /> Trade</Link>
            </div>
          </div>
        </Drawer>
        <Content className="site-layout">
          <div className="site-layout-background" style={{ padding: 12, minHeight: '90vh' }}>
            <Switch>
              <Route exact path="/">
                <Index />
              </Route>
              <Route path="/watcher">
                <Watcher />
              </Route>
              <Route path="/trade">
                <Trade />
              </Route>
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', color: '#707A8A' }}>
          <div>
            Tu Huynh &copy; 2021 - <a style={{ color: 'white' }} href="https://github.com/tuhuynh27/binance-app" target="_blank" rel="noreferrer">Github</a>
          </div>
        </Footer>
      </Router>
    </Layout>
  )
}

export default React.memo(App)
