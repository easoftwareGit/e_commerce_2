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

import { fetchUserCart } from '../src/store/cart/cartSlice';
import { fetchCartItems } from '../src/store/cart/cartItemsSlice';
import { cartTotalActions } from '../src/store/cart/cartTotalSlice';

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
          
  // const selectorData = useSelector((state) => state.user.data)  
  // const [user, setUser] = useState({selectorData});  
  
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

  // const isLoggedInTest = async () => {    
  //   try {
  //     const response = await axios({
  //       method: 'get',
  //       withCredentials: true,
  //       url: `${baseApi}/auth/is_logged_in`
  //     });
  //     if (response) {
  //       document.getElementById("testData").value = "Yes, Logged in"
  //       return true
  //     } else {
  //       document.getElementById("testData").value = "NOT Logged in"
  //       return false
  //     }
  //   } catch (err) {
  //     if (err.response.status !== 401) {
  //       const errCode = err.response.status ? err.response.status : 'unknown'
  //       const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
  //       console.log(`${errMsg} with code: ${errCode}`);
  //     }
  //     document.getElementById("testData").value = "NOT Logged in"
  //     return false
  //   }
  // }

  // const checkedLoggedIn = () => {
  //   let loggedInStatus = ""
  //   const userloggedIn = isLoggedInTest()
  //   if (userloggedIn) {
  //     loggedInStatus = "Yes, Logged in"
  //   } else {
  //     loggedInStatus = "NOT Logged in"
  //   }
  //   document.getElementById("testData").value = loggedInStatus
  // }

  // const userServer = async () => {
  //   const user = await getUserFromServer();
  //   if (user) {
  //     document.getElementById("testData").value = "Server - Name: " + user.first_name;
  //   } else {
  //     document.getElementById("testData").value = "NOT from server"
  //   }
  // }
  
  // const userState = () => {
  //   setUser(selectorData)
  //   if (!selectorData) {
  //     document.getElementById("testData").value = "NOT from state"
  //   } else if (selectorData && selectorData.uuid) {
  //     document.getElementById("testData").value = "State - Name: " + selectorData.first_name;
  //     console.log(selectorData);
  //   } else if (user && user.uuid) {
  //     document.getElementById("testData").value = "State - Name: " + user.first_name;
  //     console.log(user);
  //   } else {
  //     document.getElementById("testData").value = "NOT from state"
  //   }
  // }

  let orderUuid;
  const cartUuid = '5365e14a-3d50-4964-aec1-48826b924038'
  const userUuid = 'c0b3ccde-d471-4a10-845f-6ebb636ff016'
  const origModified = new Date('10/06/2023')

  const findCart = async () => {
    try {
      const response = await axios({
        method: 'get',        
        withCredentials: true,
        url: `${baseApi}/carts/cart/${cartUuid}`
      });
      if (response.status === 200) {
        return response.data
      } else {
        return null
      }        
    } catch (err) {
      return null
    }
  }

  const insertCart = async () => {
    try {
      const newCart = {
        uuid: cartUuid,
        created: new Date('09/25/2023'),
        modified: origModified,
        user_uuid: userUuid
      }
      const response = await axios({
        method: 'post',
        data: newCart,
        withCredentials: true,
        url: `${baseApi}/carts/fullcartrow`
      }); 
      if (response.status === 201) {
        return true
      } else {
        alert('resetCart: non 200 response status')  
        return false
      }
    } catch (err) {
      return null;
    }
  }

  const resetCart = async () => {    
    
    try {
      const cart = await findCart()      
      if (!cart) {
        const newCart = insertCart()
        if (newCart) {
          return true  
        } else {
          return false
        } 
      } else {
        const modifiedCart = {
          modified: origModified
        }
        const response = await axios({
          method: 'put',
          data: modifiedCart,
          withCredentials: true,
          url: `${baseApi}/carts/${cartUuid}`
        });
        if (response.status === 200) {
          return true
        } else {
          alert('resetCart: non 200 response status')  
          return false
        }
      }
    } catch (err) {      
      return false
    }
  }

  const reAddCartItem = async (item) => {
    try {
      const cartItem = {
        product_uuid: item.product_uuid,
        quantity: item.quantity
      }
      const response = await axios({
        method: 'post',
        data: cartItem,
        withCredentials: true,
        url: `${baseApi}/carts/${cartUuid}/items`        
      })      
      if (response.status === 201) {
        return true
      } else {
        alert('reAddCartItem: non 200 response status')
        return false
      }
    } catch (err) {      
      return false
    }
  }

  const resetCartItems = async () => {    
    const restoreItems = [
      {
        product_uuid: '02e90226-87d1-3c2c-922d-43682e6b6a80',
        quantity: 2
      },
      {
        product_uuid: '56d916ec-e6b5-0e62-9330-0248c6792316',
        quantity: 1
      },
      {
        product_uuid: 'fa79198c-d471-018d-1498-deba88a184ef',
        quantity: 3
      },
      {
        product_uuid: 'a78f0737-89cc-0f8a-9a0d-e8c6e273eab1',
        quantity: 1
      },
    ]
    try {
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: `${baseApi}/carts/${cartUuid}/allItems`        
      })
      if (response.status === 200) {
        restoreItems.forEach(async (item) => {
          const didAdd = await reAddCartItem(item)
          if (!didAdd) {
            return false
          }
        });
        return true
      } else {
        alert('resetCartItems; Delete: non 200 response status')  
        return false
      }
    } catch (err) {      
      return false      
    }
  }

  const getOrder = async () => {
    try {
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/orders/user/${userUuid}`
      })
      if (response.status === 200) {
        orderUuid = response.data.uuid        
        return true
      } else {
        alert('getOrder: non 200 response status')  
        return false
      }
    } catch (err) {      
      return false      
    }
  }

  const removeOrderItems = async () => {    
    try {
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: `${baseApi}/orders/${orderUuid}/allItems`
      })
      if (response.status === 200) {
        return true
      } else {
        alert('removeOrderItems: non 200 response status')  
        return false
      }
    } catch (err) {      
      return false      
    }
  }

  const removeOrder = async () => {    
    try {
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: `${baseApi}/orders/${orderUuid}`
      })
      if (response.status === 200) {
        return true
      } else {
        alert('removeOrder: non 200 response status')  
        return false
      }
    } catch (err) {      
      return false      
    }
  }

  const resetBeforePayment = async () => {

    if (await resetCart()) {
      if (await resetCartItems()) {
        if (await getOrder()) {
          if (await removeOrderItems()) {
            await removeOrder()            
          }
        }
      }
    }
  }  

  const dispatch = useDispatch()
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const cartItems = useSelector((state) => state.cartItems);
  const cartTotal = useSelector((state) => state.cartTotal)
  const getCartFromState = async () => {
    await dispatch(fetchUserCart(user.data.uuid))    
  }
  const getCartItemsFromState = async () => {    
    await dispatch(fetchCartItems(cart.data.uuid))    
  }
  const getCartTotalFromState = () => {
    dispatch(cartTotalActions.getTotal(cartItems.data))
  }
  const showCartInConsole = () => {
    console.log(cart.data)
    console.log(cartItems.data)
    console.log(cartTotal.data)
  }

  return (
    <Router>
      <Fragment>
        <Header ref={headerRef} />
        <button onClick={resetBeforePayment}>
          Reset Order
        </button>
        <button onClick={getCartFromState}>
          Get Cart from State
        </button>
        <button onClick={getCartItemsFromState}>
          Get Cart Items from State
        </button>
        <button onClick={getCartTotalFromState}>
          Get Cart Total from State
        </button>
        <button onClick={showCartInConsole}>
          Show Cart in Console
        </button>
        <Link to={`${clientBaseUrl}/complete`}>
          <button>
            Paid for Order
          </button>
        </Link>
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
        {/* <Route
          path="/complete"
          element={<OrderComplete />}
        /> */}
        
        <Route path="/order/history" element={<OrderHistory />} />

      </Routes>
    </Router>
  );
}

export default App;
