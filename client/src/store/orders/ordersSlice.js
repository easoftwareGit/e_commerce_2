import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: [],
  error: '',
}

export const fetchUserOrders = createAsyncThunk('orders/fetchOrders', async (user_uuid) => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/orders/users/${user_uuid}`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('Fetch Orders - Non error return, but not status 200');
      return [];
    }
  } catch (err) {
    return [];
  }
});

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialState,
  reducers: { },  
  extraReducers: (builder) => {
    builder.addCase(fetchUserOrders.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchUserOrders.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchUserOrders.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
  }
});

export default ordersSlice.reducer;