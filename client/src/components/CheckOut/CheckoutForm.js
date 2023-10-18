import { useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { Modal } from 'bootstrap';
import ModalMsg from '../ModalMsg';
import { clientBaseUrl, formatter } from "../../tools/tools";
import './checkout.css';
import { Link, Navigate } from "react-router-dom";

function CheckoutForm() {

  console.log(clientBaseUrl);  

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart); 
  const cartItems = useSelector((state) => state.cartItems)
  const cartTotal = useSelector((state) => state.cartTotal);
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })

  const changeShippingAddress = () => {
    showModal("Shipping Address", "Change shipping address goes here.");
  }
  const populateBillingAddress = () => {
    showModal("Billing Address", "Populate billing addres with shipping address.");
  }
  const changeBillingAddress = () => {
    showModal("Billing Address", "Change billing address goes here.");
  }

  const showModal = (title, message) => {    
    setModalInfo({
      title: title,
      message: message
    })
    var myModal = new Modal(document.getElementById('modalPopup'))
    myModal.show();
  }

  console.log(`${clientBaseUrl}/complete`);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${clientBaseUrl}/complete`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment status: ' + paymentIntent.status)
      navigate('/complete');  
    } else {
      setMessage('Unexpected state')
    }

    setIsProcessing(false);
  };

  return (

    <div>
      {/* modal popup message */}
      <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}
      />      
      
      <div id="payment-container">
        <div className="row"> 
          <div className="col-md-6 col-sm-12" id="ship-bill-address">
            <h3>Shipping Adress</h3>
            <div className="row">
              <div className="col-sm-9">
                <p>
                  First Last<br />
                  123 Main St<br />
                  Somewhere, CA 99999
                </p>
              </div>
              <div className="col-sm-3">
                <Link onClick={changeShippingAddress}>
                  Change
                </Link>
              </div>
            </div>
            <h3>Billing Adress</h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={populateBillingAddress}
            >
              Use Shipping Address
            </button>
            <div className="row">
              <div className="col-sm-9">
                <p>
                  First Last<br />
                  123 Main St<br />
                  Somewhere, CA 99999
                </p>
              </div>
              <div className="col-sm-3">
                <Link onClick={changeBillingAddress}>
                  Change
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12">
            <form id="payment-form" onSubmit={handleSubmit}>
              <h3>Payment Amount: {cartTotal.data ? formatter.format(cartTotal.data) : ''}</h3>
              <PaymentElement />
              <button
                class="btn btn-primary mt-3 mb-2"
                disabled={isProcessing}
                id="submit"
              >
                <span id="button-text">
                  {isProcessing ? "Processing..." : "Pay now"}
                </span>
              </button>
              {/* Show any error or success messages */}
              {message && <div id="checkout-message">{message}</div>}
            </form>
          </div>       
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;