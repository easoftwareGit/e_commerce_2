import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { baseApi } from "../../tools/tools";

const initialState = {
  loading: false,
  data: {},
  error: '',
}

export const fetchOneProduct = createAsyncThunk('product/fetchProduct', async (uuid) => {
  try {
    const response = await axios({
      method: 'get',
      withCredentials: true,
      url: `${baseApi}/products/${uuid}`,
    });
    if (response.status === 200 && response.data) {
      return response.data; // response.data is already JSON'ed
    } else {
      console.log('One Product - Non error return, but not status 200');
      return {};
    }
  } catch (err) {
    return {};
  }
});

export const oneProductSlice = createSlice({
  name: 'oneProduct',
  initialState: initialState,
  reducers: { },  
  extraReducers: (builder) => {
    builder.addCase(fetchOneProduct.pending, (state) => {
      state.loading = true; 
      state.error = '';
    })
    builder.addCase(fetchOneProduct.fulfilled, (state, action) => {
      state.loading = false;      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchOneProduct.rejected, (state, action) => {      
      state.loading = false;
      state.error = action.error.message;
    })
  }
});

export default oneProductSlice.reducer;