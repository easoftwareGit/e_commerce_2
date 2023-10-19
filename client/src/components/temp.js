// debugging code in App.js

  // import { fetchUserCart } from '../src/store/cart/cartSlice';
  // import { fetchCartItems } from '../src/store/cart/cartItemsSlice';
  // import { cartTotalActions } from '../src/store/cart/cartTotalSlice';

  // is user logged in tests

  // const isLoggedInTest = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'get',
  //       withCredentials: true,
  //       url: `${baseApi}/auth/is_logged_in`
  //     });
  //     if (response) {
  //       document.getElementById("testData").value = "Yes, Logged in"
  //       return true
  //     } else {
  //       document.getElementById("testData").value = "NOT Logged in"
  //       return false
  //     }
  //   } catch (err) {
  //     if (err.response.status !== 401) {
  //       const errCode = err.response.status ? err.response.status : 'unknown'
  //       const errMsg = err.response.data.message ? err.response.data.message : 'Unknown error'
  //       console.log(`${errMsg} with code: ${errCode}`);
  //     }
  //     document.getElementById("testData").value = "NOT Logged in"
  //     return false
  //   }
  // }

  // const checkedLoggedIn = () => {
  //   let loggedInStatus = ""
  //   const userloggedIn = isLoggedInTest()
  //   if (userloggedIn) {
  //     loggedInStatus = "Yes, Logged in"
  //   } else {
  //     loggedInStatus = "NOT Logged in"
  //   }
  //   document.getElementById("testData").value = loggedInStatus
  // }

  // const userServer = async () => {
  //   const user = await getUserFromServer();
  //   if (user) {
  //     document.getElementById("testData").value = "Server - Name: " + user.first_name;
  //   } else {
  //     document.getElementById("testData").value = "NOT from server"
  //   }
  // }
  
  // const userState = () => {
  //   setUser(selectorData)
  //   if (!selectorData) {
  //     document.getElementById("testData").value = "NOT from state"
  //   } else if (selectorData && selectorData.uuid) {
  //     document.getElementById("testData").value = "State - Name: " + selectorData.first_name;
  //     console.log(selectorData);
  //   } else if (user && user.uuid) {
  //     document.getElementById("testData").value = "State - Name: " + user.first_name;
  //     console.log(user);
  //   } else {
  //     document.getElementById("testData").value = "NOT from state"
  //   }
  // }

  // checkout tests

  // const dispatch = useDispatch()
  // let orderUuid;
  // const cartUuid = '5365e14a-3d50-4964-aec1-48826b924038'
  // const userUuid = 'c0b3ccde-d471-4a10-845f-6ebb636ff016'
  // const origModified = new Date('10/06/2023')

  // const findCart = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'get',
  //       withCredentials: true,
  //       url: `${baseApi}/carts/cart/${cartUuid}`
  //     });
  //     if (response.status === 200) {
  //       return response.data
  //     } else {
  //       return null
  //     }
  //   } catch (err) {
  //     return null
  //   }
  // }

  // const insertCart = async () => {
  //   try {
  //     const newCart = {
  //       uuid: cartUuid,
  //       created: new Date('09/25/2023'),
  //       modified: origModified,
  //       user_uuid: userUuid
  //     }
  //     const response = await axios({
  //       method: 'post',
  //       data: newCart,
  //       withCredentials: true,
  //       url: `${baseApi}/carts/fullcartrow`
  //     });
  //     if (response.status === 201) {
  //       return true
  //     } else {
  //       alert('resetCart: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return null;
  //   }
  // }

  // const resetCart = async () => {
    
  //   try {
  //     const foundCart = await findCart()
  //     if (!foundCart) {
  //       const newCart = insertCart()
  //       if (newCart) {
  //         return true
  //       } else {
  //         return false
  //       }
  //     } else {
  //       const modifiedCart = {
  //         modified: origModified
  //       }
  //       const response = await axios({
  //         method: 'put',
  //         data: modifiedCart,
  //         withCredentials: true,
  //         url: `${baseApi}/carts/${cartUuid}`
  //       });
  //       if (response.status === 200) {
  //         return true
  //       } else {
  //         alert('resetCart: non 200 response status')
  //         return false
  //       }
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }

  // const reAddCartItem = async (item) => {
  //   try {
  //     const cartItem = {
  //       product_uuid: item.product_uuid,
  //       quantity: item.quantity
  //     }
  //     const response = await axios({
  //       method: 'post',
  //       data: cartItem,
  //       withCredentials: true,
  //       url: `${baseApi}/carts/${cartUuid}/items`
  //     })
  //     if (response.status === 201) {
  //       return true
  //     } else {
  //       alert('reAddCartItem: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }

  // const resetCartItems = async () => {
  //   const restoreItems = [
  //     {
  //       product_uuid: '02e90226-87d1-3c2c-922d-43682e6b6a80',
  //       quantity: 2
  //     },
  //     {
  //       product_uuid: '56d916ec-e6b5-0e62-9330-0248c6792316',
  //       quantity: 1
  //     },
  //     {
  //       product_uuid: 'fa79198c-d471-018d-1498-deba88a184ef',
  //       quantity: 3
  //     },
  //     {
  //       product_uuid: 'a78f0737-89cc-0f8a-9a0d-e8c6e273eab1',
  //       quantity: 1
  //     },
  //   ]
  //   try {
  //     const response = await axios({
  //       method: 'delete',
  //       withCredentials: true,
  //       url: `${baseApi}/carts/${cartUuid}/allItems`
  //     })
  //     if (response.status === 200) {
  //       restoreItems.forEach(async (item) => {
  //         const didAdd = await reAddCartItem(item)
  //         if (!didAdd) {
  //           return false
  //         }
  //       });
  //       return true
  //     } else {
  //       alert('resetCartItems; Delete: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }
    
  // const getOrder = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'get',
  //       withCredentials: true,
  //       url: `${baseApi}/orders/user/${userUuid}`
  //     })
  //     if (response.status === 200) {
  //       orderUuid = response.data.uuid
  //       return true
  //     } else {
  //       alert('getOrder: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }

  // const removeOrderItems = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'delete',
  //       withCredentials: true,
  //       url: `${baseApi}/orders/${orderUuid}/allItems`
  //     })
  //     if (response.status === 200) {
  //       return true
  //     } else {
  //       alert('removeOrderItems: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }

  // const removeOrder = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'delete',
  //       withCredentials: true,
  //       url: `${baseApi}/orders/${orderUuid}`
  //     })
  //     if (response.status === 200) {
  //       return true
  //     } else {
  //       alert('removeOrder: non 200 response status')
  //       return false
  //     }
  //   } catch (err) {
  //     return false
  //   }
  // }

  // const resetBeforePayment = async () => {

  //   if (await resetCart()) {
  //     if (await resetCartItems()) {
  //       if (await getOrder()) {
  //         if (await removeOrderItems()) {
  //           await removeOrder()
  //         }
  //       }
  //     }
  //   }
  // }
  
  // const cart = useSelector((state) => state.cart);
  // const cartItems = useSelector((state) => state.cartItems);
  // const cartTotal = useSelector((state) => state.cartTotal)
  // const getCartFromState = async () => {
  //   await dispatch(fetchUserCart(user.data.uuid))    
  // }
  // const getCartItemsFromState = async () => {    
  //   await dispatch(fetchCartItems(cart.data.uuid))    
  // }
  // const getCartTotalFromState = () => {
  //   dispatch(cartTotalActions.getTotal(cartItems.data))
  // }
  // const showCartInConsole = () => {
  //   console.log(cart.data)
  //   console.log(cartItems.data)
  //   console.log(cartTotal.data)
  // }

  // test buttons in header
  
  // <button onClick={resetBeforePayment}>
  //   Reset Order
  // </button>
  // <button onClick={getCartFromState}>
  //   Get Cart from State
  // </button>
  // <button onClick={getCartItemsFromState}>
  //   Get Cart Items from State
  // </button>
  // <button onClick={getCartTotalFromState}>
  //   Get Cart Total from State
  // </button>
  // <button onClick={showCartInConsole}>
  //   Show Cart in Console
  // </button>
  // <Link to={`${clientBaseUrl}/complete`}>
  //   <button>
  //     Paid for Order
  //   </button>
  // </Link>
