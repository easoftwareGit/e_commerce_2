const createSlice = require('@reduxjs/toolkit').createSlice;
const asMoney = require('../../tools/tools').asMoney;

const initialState = {
  data: null
}

const cartTotalSlice = createSlice({
  name: 'cartTotal',
  initialState,
  reducers: {
    getTotal: (state, action) => {
      const items = action.payload;
      let total = 0
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const money = asMoney(parseFloat(item.item_total))          
          total += money
        }
      }
      state.data = asMoney(total);
    },
  }
});

module.exports = cartTotalSlice.reducer;
module.exports.cartTotalActions = cartTotalSlice.actions;