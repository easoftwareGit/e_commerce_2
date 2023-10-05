const createSlice = require('@reduxjs/toolkit').createSlice;

const initialState = {
  data: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loggedIn: (state, action) => {
      state.data = action.payload;
    },
    loggedOut: (state) => {
      state.data = null
    }
  }
});

module.exports = userSlice.reducer;
module.exports.userActions = userSlice.actions;