import React, { Fragment, useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Header from './components/Header/Header';

import Products from './components/Products/Products';
import OneProduct from './components/Products/OneProduct';
import OrderHistory from './components/Orders/OrderHistory';
import OrderComplete from './components/Orders/OrderComplete';
import Cart from './components/Cart/Cart'
import Payment from './components/CheckOut/Payment';
import LogIn from './components/LogInOut/LogIn';
import Register from './components/LogInOut/Register';
import LogOut from './components/LogInOut/LogOut';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import axios from 'axios';
import { baseApi, clientBaseUrl } from '../src/tools/tools';

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

  // const showRegisteredMenu = () => {
  //   if (headerRef && headerRef.current) {
  //     headerRef.current.showRegisteredMenu()
  //   }
  // }

  // const showNotRegisteredMenu = () => {
  //   if (headerRef && headerRef.current) {
  //     headerRef.current.showNotRegisteredMenu()
  //   }
  // }
            
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
  
  const user = useSelector((state) => state.user);

  return (
    <Router>
      <Fragment>
        <Header ref={headerRef} />
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
        
        <Route
          path="/payment"
          element={<ProtectedRoute element={<Payment />} />}
        />

        <Route
          path="/complete"
          element={<ProtectedRoute element={<OrderComplete />} />}
        />
        <Route
          path="/order/history"
          element={<ProtectedRoute element={<OrderHistory />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
