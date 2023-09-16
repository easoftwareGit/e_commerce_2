import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { Modal } from 'bootstrap';
import ModalMsg from './ModalMsg';
import { formatter } from "../tools/tools";

const Products = (props) => {

  const { baseApi } = props;
  
  const imageBaseUrl = '/images/';

  const [products, setProducts] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })

  const getProducts = async () => {
    try {      
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/products`,
      });
      if (response.status === 200 && response.data) {
        setProducts(response.data); // response.data is already JSON'ed
      } else {
        console.log('Products - Non error return, but not status 200');
        showModal("Internal Error", "Something went wrong")
        setProducts([]);        
      }
    } catch (err) {
      if (err.response && err.response.status && err.response.data && err.response.data.message) {
        if (err.response.status === 404) {
          showModal("Invalid Data", "Incorrect email or password")
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
          console.log('Login - unknown error')
        }
        showModal("Internal Error", "Something went wrong");
      }          
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

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

      <h2>Products</h2>      

      <div className="container">
        <div className="row">
          {products.map(product => (
            <div
              className="col-sm-12 col-md-6 col-lg-4 col-xl-3 col-xxl-2 productCol"              
            >
              <h4>{product.name}</h4>
              <h5>{product.category}</h5>
              <div className="thumbnailContainer">                
                <img
                  src={`${imageBaseUrl}${product.guid}.png`}
                  alt={product.name}
                  className="img-thumbnail"
                />                                
              </div>
              <div>{product.description}</div>
              <div>{formatter.format(product.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Products;