import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
// import { Modal } from 'bootstrap';
// import ModalMsg from '../ModalMsg';
import { formatter, imageBaseUrl } from "../../tools/tools";
import { productsId } from "../Header/MenuItems";

import { fetchProducts } from "../../store/products/productsSlice";

const Products = props => {

  const { setActiveMenuItem } = props;  
  setActiveMenuItem(productsId);

  const dispatch = useDispatch()
  const products = useSelector((state) => state.products);

  useEffect(() => {    
    dispatch(fetchProducts());
  }, [dispatch]);

  // const [modalInfo, setModalInfo] = useState({
  //   title: "title",
  //   message: "message"
  // })
  // const showModal = (title, message) => {    
  //   setModalInfo({
  //     title: title,
  //     message: message
  //   })
  //   var myModal = new Modal(document.getElementById('modalPopup'))
  //   myModal.show();
  // }

  return (
    <Fragment>
      {/* modal popup message */}
      {/* <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}
      /> */}

      <p className="h2 m-2">Products</p> 

      {products.loading && <div>Loading...</div>}
      {!products.loading && products.error ? <div>Error: {products.error}</div> : null}      

      {!products.loading && products.data.length ? ( 
        <div className="container">
          <div className="row">
            {products.data.map(product => (               
              <div className="col-sm-12 col-md-6 col-xl-4 col-xxl-3 mb-3 mb-sm-0" key={product.uuid}>
                <div className="card">
                  <div className="row g-0">
                    <div className="col-md-4">                      
                      <Link to={`/products/${product.uuid}`}>
                        <img                           
                          src={`${imageBaseUrl}${product.uuid}.png`}
                          className="img-fluid productCardImage"
                          alt={product.name}                        
                        />
                      </Link>
                    </div>
                    <div className="col-md-8">
                      <div className="card-body">
                        <h4>{product.name}</h4>
                        <h5>{product.category}</h5>
                        <Link
                          to={`/products/${product.uuid}`}
                          className="productLink"
                        >
                          <p>{product.description}</p>
                        </Link>                        
                        <p>{formatter.format(product.price)}</p>
                      </div>
                    </div>                    
                  </div>
                </div>
              </div>              
            ))}
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default Products;