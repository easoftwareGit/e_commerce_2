import { configureStore } from "@reduxjs/toolkit";
import productsReducer from './products/productsSlice';
import oneProductReducer from './products/oneProductSlice';
import userReducer from "./users/usersSlice";
import cartReducer from './cart/cartSlice';
import cartItemsReducer from './cart/cartItemsSlice';
import cartTotalReducer from './cart/cartTotalSlice';

const store = configureStore({
  reducer: {    
    products: productsReducer,    
    oneProduct: oneProductReducer,
    user: userReducer,
    cart: cartReducer,
    cartItems: cartItemsReducer,
    cartTotal: cartTotalReducer,
  }
})

export default store;