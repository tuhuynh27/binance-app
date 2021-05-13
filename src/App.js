import './App.css'
import React from 'react'

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import Index from './views/Index/Index'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Index />
        </Route>
      </Switch>
    </Router>
  );
}

export default React.memo(App)
