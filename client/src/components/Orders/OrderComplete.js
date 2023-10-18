import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserCart } from '../../store/cart/cartSlice';
import { fetchCartItems } from "../../store/cart/cartItemsSlice";
import { cartTotalActions } from "../../store/cart/cartTotalSlice";
import { clearItems } from '../../store/cart/cartItemsSlice';
import { userActions } from '../../store/users/usersSlice';
import { formatter, baseApi } from "../../tools/tools";

let nonZeroTotal = null
const OrderComplete = (props) => {    
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart); 
  const cartItems = useSelector((state) => state.cartItems)
  const cartTotal = useSelector((state) => state.cartTotal)

  if (cartTotal.data > 0) {
    nonZeroTotal = cartTotal.data
  }

  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');  

  const updateOrderHistory = async () => {   
    try {      

      if (!cart.data || !cart.data.uuid) {
        return;
      }      

      // POST to localhost:5000/api/carts/uuid/checkout 
      // where uuid is uuid of cart
      // moves data from cart to order, cartItems -> order items
      const response = await axios({
        method: 'post',
        data: cart.data,
        withCredentials: true,
        url: `${baseApi}/carts/${cart.data.uuid}/checkout`
      });
      if (response.status === 201) {
        setOrder(response.data)
        dispatch(clearItems());
        dispatch(cartTotalActions.getTotal([]))
        setMessage('Your order is on the way!')
        return response.data.order
      } else {
        setMessage(response.message)
        return null
      }              
    } catch (err) {
      setMessage('Sorry - Unknown error')
      return null;
    }
  }

  useEffect(() => {
    if (user && user.data.uuid) {
      dispatch(fetchUserCart(user.data.uuid))
    }
  }, [user.data.uuid])

  useEffect(() => {
    if (cart.data.uuid) {
      dispatch(fetchCartItems(cart.data.uuid))
    }
  }, [cart.data.uuid])

  useEffect(() => {
    if (cartItems.data) {
      dispatch(cartTotalActions.getTotal(cartItems.data))
    }
  }, [cartItems.data])

  useEffect(() => {
    updateOrderHistory()    
  }, [])

  return (

    <div>
      {!user && !user.data && !user.data.uuid && <Navigate to='/login' />}
      {order ? (
        <div className="m-2">
          <h2>Order Complete!</h2>          
          <h4>Your order is on the way!</h4>          
          <h5>You have been charged: {formatter.format(nonZeroTotal)}</h5>          
        </div>
      ) : (
        <div className="m-2">
          <h2 id="order_error">Order Status</h2>
          <h5>{message}</h5>  
        </div>
      )}
    </div>
  );
};

export default OrderComplete;