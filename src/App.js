import './App.css'
import React from 'react'

import { Layout, Menu } from 'antd'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import Index from './views/Index/Index'

import Argg from 'assets/img/argg.gif'

const { Header, Content, Footer } = Layout

function App() {
  return (
    <Layout>
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        <Menu.Item key="1">Binance Holder App</Menu.Item>
      </Menu>
    </Header>
    <Content className="site-layout">
      <div className="site-layout-background" style={{ padding: 24, minHeight: '90vh' }}>
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
