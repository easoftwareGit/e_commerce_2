import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: {},
  error: '',
}

export const fetchUserCart = createAsyncThunk('cart/fetchUserCart', async (user_uuid) => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/carts/user/${user_uuid}`,
    }); 
    if (response.status === 200 && response.data) {      
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('Cart get - Non error return, but not status 200');
      return {};
    }
  } catch (err) {
    return {};
  }
});

export const modifiedCart = createAsyncThunk('cart/modifiedCart', async (cartData) => {
  try {
    const response = await axios({
      method: 'put',
      data: cartData,
      withCredentials: true,
      url: `${baseApi}/carts/${cartData.uuid}`
    });
    if (response === 200 && response.data) {
      return response.data; // response.data is cart object
    } else {
      console.log('Cart put - Non error return, but not status 200');
      return {};
    }
  } catch (err) {
    return {};
  }
})

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialState,
  reducers: { 
    loadCart: (state, action) => {
      state.data = action.payload;
    }
  },  
  extraReducers: (builder) => {    
    builder.addCase(fetchUserCart.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchUserCart.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchUserCart.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
    builder.addCase(modifiedCart.pending, (state) => {
      state.loading = true;
      state.error = '';
    })
    builder.addCase(modifiedCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = ''
    })
    builder.addCase(modifiedCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
  }
});

export default cartSlice.reducer;
export const { loadCart } = cartSlice.actions;
