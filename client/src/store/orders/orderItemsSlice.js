import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: [],
  error: '',
}

export const fetchUserOrderItems = createAsyncThunk('orderItems/fetchUserOrderItems', async (user_uuid) => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/orders/items/user/${user_uuid}`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('Fetch Order Items - Non error return, but not status 200');
      return [];
    }
  } catch (err) {
    return [];
  }
});

export const ordersItemsSlice = createSlice({
  name: 'orderItems',
  initialState: initialState,
  reducers: { },  
  extraReducers: (builder) => {
    builder.addCase(fetchUserOrderItems.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchUserOrderItems.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchUserOrderItems.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
  }
});

export default ordersItemsSlice.reducer;