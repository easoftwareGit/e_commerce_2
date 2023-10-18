import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'bootstrap';
import ModalMsg from '../ModalMsg';
import { formatter, baseApi, imageBaseUrl } from "../../tools/tools";

import { fetchOneProduct } from '../../store/products/oneProductSlice';
import { modifiedCart } from '../../store/cart/cartSlice';

import './oneProduct.css';

const OneProduct = props => {
  
  const { getUserFromServer } = props;
  const { uuid } = useParams();
  
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })
  
  const [formData, setFormData] = useState({
    quantity: '1',
  });

  const dispatch = useDispatch()
  const product = useSelector((state) => state.oneProduct);

  useEffect(() => {
    dispatch(fetchOneProduct(uuid));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const findCartForUser = async (user) => {
    const cartObj = {
      user_uuid: user.uuid,
      cart: null,
      status: 0,
      error: '',
    };
    try {
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/carts/user/${user.uuid}`
      });
      if (response.status === 200) {
        cartObj.cart = response.data;
        cartObj.status = response.status
      } else if (response.status === 404) {
        cartObj.status = response.status
        cartObj.error = 'No cart found fur user'
      } else {
        showModal("Internal Error", "Something went wrong");
        cartObj.status = response.status
        cartObj.error = response.statusText
      }
    } catch (err) {
      if (err.response.status === 404) {
        cartObj.status = err.response.status
        cartObj.error = 'No cart found for user'        
      } else {
        cartObj.status = 400
        if (err.message) {
          console.log(err.message)
          cartObj.error = err.message
        } else if (err.response.data.message) {
          console.log(err.response.data.message)
          cartObj.error = err.response.data.message
        } else {
          console.log('findCartForUser - unknown error')
          cartObj.error = 'unknown error'
        }
        showModal("Internal Error", "Something went wrong");
      }
    }
    return cartObj
  }

  const createNewCartForUser = async (user) => {
    try {
      const newCart = {
        created: new Date(Date.now()),
        user_uuid: user.uuid,
      }
      const response = await axios({
        method: 'post',
        data: newCart,
        withCredentials: true,
        url: `${baseApi}/carts`
      });
      if (response.status === 201) {
        return response.data;
      } else {
        console.log('createNewCartForUser - unknown error')
        showModal("Internal Error", "Could not create cart for user");
        return null
      }
    } catch (err) {
      if (err.response && err.response.status && err.response.data) {
        if (err.response.status === 404) {
          showModal("Server Error", "Error: 404, could not create cart for user");
        } else if (err.response.status === 400 ) {
          console.log(err.response.data)
          showModal("Server Error", "Error 400, could not create cart for user");
        } else {
          console.log(err.response.data)
          showModal("Internal Error", "Something went wrong");
        }
      } else {
        if (err.message) {
          console.log(err.message)
        } else if (err.response.data.message) {
          console.log(err.response.data.message)
        } else {
          console.log('Register - unknown error')
        }
        showModal("Internal Error", "Something went wrong");
      }
      return null
    }
  }

  const updateCartModified = async (cartObj) => {    
    // note: uuid is never modified. it is passed in the modifiedData data 
    //       so the PUT route can modify the correct database row
    const modifiedData = {
      uuid: cartObj.cart.uuid,
      modified: new Date(Date.now())
    }    
    await dispatch(modifiedCart(modifiedData))
  }

  const addItemToCart = async (cartObj) => {
    const qty = parseInt(formData.quantity)
    const cart_item = {
      product_uuid: uuid,
      quantity: qty
    }
    try {
      const response = await axios({
        method: 'post',
        data: cart_item,
        withCredentials: true,
        url: `${baseApi}/carts/${cartObj.cart.uuid}/items`
      });
      if (response.status === 201) {        
        return response.data
      } else {
        console.log('addItemToCart - unknown error')
        showModal("Internal Error", "Could not add item to cart");
        return null
      }
    } catch (err) {
      if (err.response && err.response.status && err.response.data && err.response.data.message) {
        if (err.response.status === 404) {
          showModal("Server Error", "Error: 404, could not create cart item for user");
        } else if (err.response.status === 400 ) {
          console.log(err.response.data.message)
          showModal("Server Error", "Error 400, could not create cart item for user");
        } else if (err.response.status === 409 ) {
          console.log(err.response.data.message)
          showModal("Server Error", "Error 409, could not create cart item for user");
        } else {
          console.log(err.response.data.message)
          showModal("Internal Error", "Something went wrong");
        }
      } else {
        if (err.message) {
          console.log(err.message)
        } else if (err.response.data.message) {
          console.log(err.response.data.message)
        } else {
          console.log('Register - unknown error')
        }
        showModal("Internal Error", "Something went wrong");
      }
      return null
    }
  }

  const handleSubmit = async (e) => {
    // find cart for user
    // if not cart row
    //   create cart row
    //   fetch cart row
    // create cart item for user    
    e.preventDefault();
    // get current logged in user
    const user = await getUserFromServer()
    if (!user) {
      showModal("Not logged in", "Please log in before ordering");
      return null;
    } else {
      // find cart for user
      let cartObj = await findCartForUser(user)
      let foundCart = true
      if (cartObj.status === 200 || cartObj.status === 404) {
        // found (200) or not found w/o error (404)
        // if did not find cart
        if (cartObj.status === 404) {
          // create new cart for user
          cartObj.cart = await createNewCartForUser(user)
          foundCart = false
        }
        if (cartObj.cart) {
          const item = await addItemToCart(cartObj);
          if (item) {
            // if found the cart, update the modified date in the cart
            if (foundCart) {
              await updateCartModified(cartObj);
            }            
            showModal("Cart updated", "Item added to cart")            
          }
        }
      }
    }
  }

  const showModal = (title, message) => {    
    setModalInfo({
      title: title,
      message: message
    })
    var myModal = new Modal(document.getElementById('modalPopup'))
    myModal.show();
  }

  return (
    <Fragment>
      {/* modal popup message */}
      <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}
      />

      {/* form */}
      <form onSubmit={handleSubmit}> 
        
        {product.loading && <div>Loading...</div>}
        {!product.loading && product.error ? <div>Error: {product.error}</div> : null}      

        {!product.loading && product.data ? (           
          <div className="container mt-4">
            <div className="card mb-3">
              <div className="row">
                <div className="col-6 mb-3 mb-sm-0">
                  <div className='oneProductImageContainer'>
                    <img
                      className='oneProductImage'
                      src={`${imageBaseUrl}${product.data.uuid}.png`}
                      alt={product.data.name}
                    />
                  </div>
                  <div className="row m-0">
                    <h4>{product.data.name}</h4>
                  </div>
                  <div className="row m-0">
                    <h5>{product.data.category}</h5>
                  </div>
                  <div className="row m-0">
                    <h6>{product.data.description}</h6>
                  </div>
                  <div className="row m-0">
                    <h6>{product.data.designer}</h6>
                  </div>
                  <div className="row m-0">
                    <h6>{formatter.format(product.data.price)}</h6>
                  </div>
                </div>
                <div className="col-6 mb-3 mb-sm-0">
                  <div className="row m-0">
                    <div className="col-auto">
                      <label for="inputQuantity" class="form-label">
                        Quantity
                      </label>
                      <select
                        className="form-select"
                        aria-label="1"
                        name="quantity"
                        onChange={handleInputChange}
                      >
                        <option selected>1</option>
                        {/* <option value="1">1</option> */}
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div className="row mt-3 mb-3">
                      <div className="col-12">
                        <button type="submit" className="btn btn-primary">Add to Cart</button>
                      </div>
                    </div>
                    {/* <div className="row mt-3 mb-3">
                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => showAlert(product.data.name)}
                        >
                          Test
                        </button>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </form>        
    </Fragment>
  );
};

export default OneProduct;
