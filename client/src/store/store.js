import { configureStore } from "@reduxjs/toolkit";
import productsReducer from './products/productsSlice';
import oneProductReducer from './products/oneProductSlice';
import userReducer from "./users/usersSlice";
import cartReducer from './cart/cartSlice';
import cartItemsReducer from './cart/cartItemsSlice';
import cartTotalReducer from './cart/cartTotalSlice';
import ordersReducer from './orders/ordersSlice';
import orderItemsReducer from './orders/orderItemsSlice';

const store = configureStore({
  reducer: {    
    products: productsReducer,    
    oneProduct: oneProductReducer,
    user: userReducer,
    cart: cartReducer,
    cartItems: cartItemsReducer,
    cartTotal: cartTotalReducer,
    orders: ordersReducer,
    orderItems: orderItemsReducer,
  }
})

export default store;