import React, { Fragment, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Header from './components/Header/Header';

import Products from './components/Products/Products';
import OneProduct from './components/Products/OneProduct';
import OrderHistory from './components/OrderHistory';
import Cart from './components/Cart/Cart'
import CheckOut from './components/CheckOut';
import LogIn from './components/LogInOut/LogIn';
import Register from './components/LogInOut/Register';
import LogOut from './components/LogInOut/LogOut';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import axios from 'axios';
import { baseApi, clientBaseUrl } from './tools/tools';

function App() {

  // In order to gain access to the child component instance,
  // you need to assign it to a `ref`, so we call `useRef()` to get one
  const headerRef = useRef();

  // setActiveMenuItem is passed as a prop to child components
  // so child component can set the header active menu item
  const setActiveMenuItem = (menuItemId) => {
    if (headerRef && headerRef.current) {
      headerRef.current.setMenuItemActive(menuItemId);
    }
  }

  const showRegisteredMenu = () => {
    if (headerRef && headerRef.current) {
      headerRef.current.showRegisteredMenu()
    }
  }

  const showNotRegisteredMenu = () => {
    if (headerRef && headerRef.current) {
      headerRef.current.showNotRegisteredMenu()
    }
  }
  
  const selectorData = useSelector((state) => state.user.data)  
  const [user, setUser] = useState({selectorData});

  const getUserFromServer = async () => {
    try {
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/auth/user`
      });
      if (response) {
        return response.data
      } else {            
        return null
      }      
    } catch (err) {
      if (err.response.status !== 401) { 
        const errCode = err.response.status ? err.response.status : 'unknown'
        const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
        console.log(`${errMsg} with code: ${errCode}`);
      }    
      return null
    }
  }

  const isLoggedInTest = async () => {    
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
  }

  const checkedLoggedIn = () => {
    let loggedInStatus = ""
    const userloggedIn = isLoggedInTest()
    if (userloggedIn) {
      loggedInStatus = "Yes, Logged in"
    } else {
      loggedInStatus = "NOT Logged in"
    }
    document.getElementById("testData").value = loggedInStatus
  }  

  const userServer = async () => {
    const user = await getUserFromServer();
    if (user) {
      document.getElementById("testData").value = "Server - Name: " + user.first_name;
    } else {
      document.getElementById("testData").value = "NOT from server"
    }
  }
  
  const userState = () => {
    setUser(selectorData)   
    if (!selectorData) { 
      document.getElementById("testData").value = "NOT from state"      
    } else if (selectorData && selectorData.uuid) {
      document.getElementById("testData").value = "State - Name: " + selectorData.first_name;
      console.log(selectorData);
    } else if (user && user.uuid) {
      document.getElementById("testData").value = "State - Name: " + user.first_name;
      console.log(user);    
    } else {
      document.getElementById("testData").value = "NOT from state"
    }
  }

  return (
    <Router>
      <Fragment>
        <Header ref={headerRef} />

        <button onClick={checkedLoggedIn}>Test</button>        
        <input type="text" id="testData" name="testData" ></input>
        <button onClick={userServer}>User Server</button>
        <button onClick={userState}>User State</button>

      </Fragment>
      <Routes>
        <Route
          path="/products"
          element={
            <Products
              setActiveMenuItem={setActiveMenuItem}
            />
          }
        />
        <Route
          path='/products/:uuid'
          element={
            <OneProduct
              getUserFromServer={getUserFromServer}
            />
          }
        >          
        </Route>
        <Route
          path="/login"
          element={
            <LogIn              
              setActiveMenuItem={setActiveMenuItem} 
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register              
              setActiveMenuItem={setActiveMenuItem}
            />
          }
        />
        <Route
          path="/logout"
          element={<LogOut            
            setActiveMenuItem={setActiveMenuItem}
          />}
        />
        <Route
          path="/"
          element={<Home
            setActiveMenuItem={setActiveMenuItem}
          />}
        />

        <Route
          path="/cart"
          element={<ProtectedRoute element={<Cart />} />}  
        />

        <Route path="/orderhistory" element={<OrderHistory />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckOut />} />        
      </Routes>
    </Router>
  );
}

export default App;
