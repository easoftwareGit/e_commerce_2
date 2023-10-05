import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
import ModalMsg from '../ModalMsg';
import { cartId } from '../Header/MenuItems';
// import { baseApi } from '../../tools/tools';
import { formatter, asMoney } from '../../tools/tools';
import QtySelect from './qtySelect';

import { fetchUserCart, modifiedCart } from '../../store/cart/cartSlice';
import { fetchCartItems, deleteCartItem, updateCartItem } from '../../store/cart/cartItemsSlice';
import { cartTotalActions } from '../../store/cart/cartTotalSlice';

const Cart = props => {

  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message",
    confirm: false,
    action: null,
    actionProps: {}
  })

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const navigate = useNavigate()

  const cart = useSelector((state) => state.cart);
  useEffect(() => {
    dispatch(fetchUserCart(user.data.uuid))
  }, [])
  
  const cartItems = useSelector((state) => state.cartItems);
  useEffect(() => {
    if (cart.data.uuid) {
      dispatch(fetchCartItems(cart.data.uuid))
    }
  }, [cart.data.uuid])

  const cartTotal = useSelector((state) => state.cartTotal)
  useEffect(() => {
    if (cartItems.data) {
      dispatch(cartTotalActions.getTotal(cartItems.data))
    }
  }, [cartItems.data])

  const updateCartModified = async () => {    
    // note: uuid is never modified. it is passed in the modifiedData data 
    //       so the PUT route can modify the correct database row
    const modifiedData = {
      uuid: cart.data.uuid,
      modified: new Date(Date.now())
    }    
    await dispatch(modifiedCart(modifiedData))
  }

  const removeItem = async (actionProps) => {
    // remove item from database, remove item from cartItems.data
    await dispatch(deleteCartItem(actionProps.item_uuid));
    await updateCartModified();
  }

  const handleInputChange = async (e) => {
    // name is item's uuid
    const { name, value } = e.target;
    const valueInt = parseInt(value)
    // find item in cartItems
    const itemIndex = cartItems.data.findIndex(item => item.uuid === name)
    const price = asMoney(parseFloat(cartItems.data[itemIndex].price));
    const itemData = {
      uuid: name,
      quantity: valueInt,
      price: price
    }
    await dispatch(updateCartItem(itemData));
    await updateCartModified();
  };

  const showConfirmRemove = (name, item_uuid) => {
    setModalInfo({
      title: "Confirm Remove",
      message: `Please confirm you want to remove item: ${name}`,
      confirm: true,
      action: removeItem,      
      actionProps: {
        item_uuid: item_uuid
      }
    })
    const myModal = new Modal(document.getElementById('modalPopup'))
    myModal.show();
  }

  const checkout = () => {    
    navigate('/checkout')
  }

  const showModal = (title, message, confirm=false) => {    
    setModalInfo({
      title: title,
      message: message,
      confirm: confirm
    })
    var myModal = new Modal(document.getElementById('modalPopup'))    
    myModal.show();
  }

  const handleSubmit = async (e) => { }

  return ( 
    <Fragment>
      {/* modal popup message */}
      <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}   
        confirm={modalInfo.confirm}
        action={modalInfo.action}
        actionProps={modalInfo.actionProps}
      />

      {/* form */}
      <form onSubmit={handleSubmit}> 
        <p className="h2 m-2">Cart</p>   

        {cart.loading && <div>Loading...</div>}
        {!cart.loading && cart.error ? <div>Error: {cart.error}</div> : null}
        {!cartItems.loading && cartItems.error ? <div>Error: {cartItems.error}</div> : null}
        {/* {(!cart.loading && cart.data && user && user.data) ? <div>Cart for {user.data.first_name}, uuid: {cart.data.uuid}</div> : null}
        {(!cart.loading && cart.data && cartItems && cartItems.data) ? <div># Items for cart: {cartItems.data.length}</div> : null}
        {(!cart.loading && cart.data && !cartItems) ? <div>No Items for cart</div> : null}
        {(!cart.loading && cart.data && (!cartTotal || cartTotal.data === 0)) ? <div>No Total for cart</div> : null}
        {(!cart.loading && cart.data && cartTotal && cartTotal.data) ? <div>Total for cart: {cartTotal.data}</div> : null} */}

        {(!cart.loading && cart.data && !cartItems.loading && cartItems.data && cartTotal && cartTotal.data) ? (
          <div className="container">
            <div class="text-center mb-3">
              <button
                type="button"
                class="btn btn-primary"
                onClick={checkout}
              >
                Check Out
              </button>
            </div>
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th scope='col' className='w-50'>Item</th>
                  <th scope='col' className='w-15 text-end'>Price</th>
                  <th scope='col' className='w-10 text-center'>Quantity</th>
                  <th scope='col' className='w-10 text-end'>Total</th>
                  <th scope='col' className='w-15 text-center'></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.data.map(item => (
                  <tr key={item.uuid}>
                    <td className='align-middle'>{item.name}</td>
                    <td className='text-end align-middle'>{formatter.format(item.price)}</td> 
                    <td className='d-flex justify-content-center'>
                      <QtySelect
                        name={item.uuid}
                        quantity={item.quantity}
                        onChange={handleInputChange}                        
                      />
                    </td>
                    <td className='text-end align-middle'>{formatter.format(item.item_total)}</td>
                    <td className='text-center'>
                      <button
                        type="button"
                        className='btn btn-danger'
                        onClick={() => showConfirmRemove(item.name, item.uuid)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>  
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope='row'>Total</th>
                  <td></td>                  
                  <td></td>
                  <td className='text-end'>{formatter.format(cartTotal.data)}</td>
                  <td></td>
                </tr>
              </tfoot>              
            </table>
          </div>
        ) : null}
      </form>  
    </Fragment>
  );
};

export default Cart;