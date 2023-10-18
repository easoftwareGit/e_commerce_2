import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: [],
  error: '',
}

export const deleteCartItem = createAsyncThunk('cartItems/deleteCartItem', async (item_uuid) => {
  try {
    const response = await axios({
      method: 'delete',
      withCredentials: true,
      url: `${baseApi}/carts/items/${item_uuid}`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is item uuid of deleted row
    } else {
      console.log('Delete Cart Item - Non error return, but not status 200');
      return null;
    }
  } catch (err) {
    return null
  }
});

export const fetchCartItems = createAsyncThunk('cartItems/fetchCartItems', async (cart_uuid) => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/carts/${cart_uuid}/items`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('Fetch Cart Items - Non error return, but not status 200');
      return [];
    }
  } catch (err) {
    return [];
  }
});

export const updateCartItem = createAsyncThunk('cartItems/updateCartItem', async (cartItem) => {
  try {
    const response = await axios({
      method: 'put',
      data: cartItem,
      withCredentials: true,
      url: `${baseApi}/carts/items/${cartItem.uuid}`,
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.log('Update Cart Items - Non error return, but not status 200');
      return {};
    }
  } catch (err) {
    return {}
  }
})

export const cartItemsSlice = createSlice({
  name: 'cartItems',
  initialState: initialState,
  reducers: { 
    clearItems: (state) => {
      state.data = []
    }
  },  
  extraReducers: (builder) => {
    builder.addCase(deleteCartItem.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(deleteCartItem.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = state.data.filter(item => item.uuid !== action.payload);
      state.error = '';
    })
    builder.addCase(deleteCartItem.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
    builder.addCase(fetchCartItems.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchCartItems.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchCartItems.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      const itemIndex = state.data.findIndex(item => item.uuid === action.payload.uuid);
      state.data[itemIndex].quantity = action.payload.quantity;
      state.data[itemIndex].item_total = action.payload.quantity * state.data[itemIndex].price;
      state.error = '';
    })
    builder.addCase(updateCartItem.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
  } 
});

export default cartItemsSlice.reducer;
// module.exports.cartItemsActions = cartItemsSlice.actions;
export const { clearItems } = cartItemsSlice.actions;