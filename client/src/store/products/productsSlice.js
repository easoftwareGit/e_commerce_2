import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: [],
  error: '',
}

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/products`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('Products - Non error return, but not status 200');
      return [];
    }
  } catch (err) {
    return [];
  }
});

export const productsSlice = createSlice({
  name: 'products',
  initialState: initialState,
  reducers: { },  
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchProducts.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
  }
});

export default productsSlice.reducer;