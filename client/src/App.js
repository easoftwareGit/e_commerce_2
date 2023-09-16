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
import axios from 'axios';

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
    try {
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/auth/is_logged_in`
      });
      if (response) {
        document.getElementById("testData").value = "Yes, Logged in"
        return true  
      } else {
        document.getElementById("testData").value = "NOT Logged in"      
        return false
      }
    } catch (err) {
      if (err.response.status !== 401) { 
        const errCode = err.response.status ? err.response.status : 'unknown'
        const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
        console.log(`${errMsg} with code: ${errCode}`);
      }
      document.getElementById("testData").value = "NOT Logged in"
      return false      
    }

    // axios({
    //   method: 'get',
    //   withCredentials: true,
    //   url: `${baseApi}/auth/is_logged_in`
    // })
    // .then((res) => {
    //   document.getElementById("testData").value = "Yes, Logged in"
    //   return true
    // })
    // .catch((err) => {
    //   if (err.response.status !== 401) { 
    //     const errCode = err.response.status ? err.response.status : 'unknown'
    //     const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
    //     console.log(`${errMsg} with code: ${errCode}`);
    //   }
    //   document.getElementById("testData").value = "NOT Logged in"
    //   return false
    // })
  }

  const checkedLoggedIn = () => {
    let loggedInStatus = ""
    const userloggedIn = isLoggedIn()
    if (userloggedIn) {
      loggedInStatus = "Yes, Logged in"
    } else {
      loggedInStatus = "NOT Logged in"
    }
    document.getElementById("testData").value = loggedInStatus
  }  

  // const loginTest = () => {
  //   axios({
  //     method: "post",
  //     data: {
  //       email: 'mike@email.com',
  //       password: '7hxk@ZSOLdY%4AD'
  //     },
  //     withCredentials: true,
  //     url: "http://localhost:5000/api/auth/login",
  //   })
  //     .then((res) => {
  //       document.getElementById("testData").value = "Yes, Logged in"
  //     })
  //     .catch((err) => {
  //       document.getElementById("testData").value = "NOT Logged in"
  //       if (err.code === 'ERR_NETWORK') {
  //         console.log("Could not connect to the network");
  //       }
  //       else if (err.response.status === 401) {
  //         console.log("Incorrect email or password");
  //       } else if (err.response.status === 500) {
  //         console.log(err.response.data.message);
  //       } else {
  //         const errCode = err.response.status ? err.response.status : 'unknown'
  //         const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
  //         console.log(`${errMsg} with code: ${errCode}`);
  //       }
  //     })
  // }

  return (
    <Router>
      <Fragment>
        <Header ref={headerRef} />

        <button onClick={checkedLoggedIn}>Test</button>        
        <input type="text" id="testData" name="testData" ></input>
        {/* <button onClick={loginTest}>Login</button> */}

      </Fragment>
      <Routes>
        <Route
          path="/products"
          element={
            <Products
              baseApi={baseApi}
            />}
        />
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
