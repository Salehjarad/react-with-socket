import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';


import Login from './components/login';
import User from './components/user';


const CheckLogin = () => {
  const token = localStorage.getItem('token');
  if(!token && token === null) {
    return <Redirect to='/signin' />
  }
  return <Redirect to='/user' />
}


function App() {
  

  return (
    <Router>
        <Switch>
          <Route exact path='/' component={CheckLogin} />
          <Route  path='/signin' component={Login} />
          <Route exact path='/user' component={User} />
        </Switch>
    </Router>
  );
}

export default App;


{/* <div className="App">
<header className="App-header">
  <p>
    Edit <code>src/App.js</code> and save to reload.
  </p>
  <Login />
</header>
</div> */}