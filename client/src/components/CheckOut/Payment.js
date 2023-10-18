import { Fragment, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import CheckoutForm from "./CheckoutForm";
import { baseApi, formatter, minDollors, moneyToSCU } from "../../tools/tools";

const Payment = (props) => {
  
  const cartTotal = useSelector((state) => state.cartTotal);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState(null);

  const fetchPublishableKey = async () => {
    try {
      const response = await axios({
        method: 'get',        
        withCredentials: true,
        url: `${baseApi}/payments/config`
      })
      if (response.status === 200 && response.data) { 
        setStripePromise(loadStripe(response.data.publishableKey))        
      } else {
        console.log('FPK - Non error return, but not status 200');        
      }
    } catch (err) {
      console.log('FPK error')
    }
  }

  const fetchClientSecret = async () => {    
    if (cartTotal.data <= minDollors) {
      setMessage(`The minimum charge is ${formatter.format(minDollors)}`)
      return;
    }      
    try {
      const cartTotalAsInt = moneyToSCU(cartTotal.data)
      const prePayment = {
        amount: cartTotalAsInt,
        currency: 'usd'
      }
      const response = await axios({
        method: 'post',
        data: prePayment,
        withCredentials: true,
        url: `${baseApi}/payments/intents`
      })
      if (response.status === 200 && response.data) { 
        setClientSecret(response.data.clientSecret)        
      } else {
        setMessage("Unnown error initializing payment")
        console.log('FCS - Non error return, but not status 200');        
      }
    } catch (err) {
      setMessage("Error initializing payment")
      console.log('FCS error')
    }
  }

  useEffect(() => {
    fetchPublishableKey()
  }, [])

  useEffect(() => {
    fetchClientSecret()
  }, [])

  return (
    <Fragment>      
      {stripePromise && clientSecret && (   
        <Elements stripe={stripePromise} options={{ clientSecret }}>          
          <CheckoutForm />        
        </Elements>          
      )}
      {message && <div id="payment-mesage">{message}</div>}
    </Fragment>
  );
};

export default Payment;