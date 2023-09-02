import React, { Fragment, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Header from './components/Header';

import Products from './components/Products';
import OrderHistory from './components/OrderHistory';
import Cart from './components/Cart'
import CheckOut from './components/CheckOut';
import LogIn from './components/LogIn';
import Register from './components/Register';
import LogOut from './components/LogOut';
import Home from './components/Home';

import './App.css';

const rootStart = process.env.REACT_APP_DEVROOT;
const pgHost = process.env.REACT_APP_PGHOST;
const serverPort = process.env.REACT_APP_SERVER_PORT;
const apiPath = process.env.REACT_APP_API;
const baseApi = `${rootStart}${pgHost}:${serverPort}${apiPath}`;

const clientPort = process.env.CLIENT_PORT;
const clientBaseUrl = `${rootStart}${pgHost}:${clientPort}`;

function App() {

  // In order to gain access to the child component instance,
  // you need to assign it to a `ref`, so we call `useRef()` to get one
  const headerRef = useRef();

  // setActiveMenuItem is passed as a prop to child components
  // so child component can set the header active menu item
  const setActiveMenuItem = (menuItemId) => {
    headerRef.current.setMenuItemActive(menuItemId);
  }

  const showRegisteredMenu = () => {    
    headerRef.current.showRegisteredMenu()
  }

  const showNotRegisteredMenu = () => {
    headerRef.current.showNotRegisteredMenu()
  }

  const isLoggedIn = async () => {    
    const response = await fetch(`${baseApi}/auth/is_logged_in`, {
      method: "GET", 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',            
      },           
      credentials: 'include'
    });   
    if (response.status === 200) {
      return true
    } else {
      return false
    }    
  }

  const checkedLoggedIn = async () => {
    let loggedInStatus = ""
    if (await isLoggedIn()) {
      loggedInStatus = "Yes, Logged in"
    } else {
      loggedInStatus = "NOT Logged in"
    }
    document.getElementById("testData").value = loggedInStatus
  }  

  return (
    <Router>
      <Fragment>
        <Header ref={headerRef} />

        <button onClick={checkedLoggedIn}>Test</button>
        <input type="text" id="testData" name="testData" ></input>

      </Fragment>
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/orderhistory" element={<OrderHistory />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route
          path="/login"
          element={
            <LogIn
              baseApi={baseApi}              
              setActiveMenuItem={setActiveMenuItem}
              showRegisteredMenu={showRegisteredMenu}            
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              baseApi={baseApi}
              setActiveMenuItem={setActiveMenuItem}
              showRegisteredMenu={showRegisteredMenu}
            />
          }
        />
        <Route
          path="/logout"
          element={<LogOut
            baseApi={baseApi}
            setActiveMenuItem={setActiveMenuItem}
            showNotRegisteredMenu={showNotRegisteredMenu}
        />}
        />
        <Route exact path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
