const express = require('express');
const paymentsRouter = express.Router();
const Stripe = require('stripe');

require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_SK_KEY);

paymentsRouter.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUB_KEY,
  })
})

paymentsRouter.post('/intents', async (req, res) => {

  // POST request
  // path: localhost:5000/api/payments/intents
  // body: JSON object
  //  {
  //    amount: 12345 - where amount with NO decimal places. $123.45 is the amount in the sample
  //    currency: 'xxx' - 3 letter code for currency
  //  }

  try {
    // create payment intenet
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency,
      automatic_payment_methods: {
        enabled: true
      }
    })

    // return the secret
    res.json({ clientSecret: paymentIntent.client_secret });
    
  } catch (err) {
    res.status(400).json('Error starting payment processing')
  }
});

module.exports = paymentsRouter;
