const expect = require('chai').expect;
const request = require('supertest');
const { assert } = require('chai');

require("dotenv").config();
const baseUrl = `${process.env.BASEURL}/payments`; 

function testPayments(app) {

  describe(`${baseUrl} routes`, function () {

    describe('get publishable key', function () {
      // publishableKey: process.env.STRIPE_PUB_KEY,

      it('return a single stripe object', async function () {
        const response = await request(app)
          .get(`${baseUrl}/config`)
          .expect(200);
        const stripeObj = response.body;
        expect(stripeObj).to.be.an.instanceOf(Object);
      });

      it('return a stripe object with publishable key', async function () {
        const response = await request(app)
          .get(`${baseUrl}/config`)
          .expect(200);
        const stripeObj = response.body;
        expect(stripeObj).to.have.ownProperty('publishableKey');
      });

      it('return a stripe object with correct publishable key', async function () {
        const response = await request(app)
          .get(`${baseUrl}/config`)
          .expect(200);
        const stripeObj = response.body;
        expect(stripeObj.publishableKey).to.be.an.equal(process.env.STRIPE_PUB_KEY);
      });
      
    });

    describe('get paymentIntent', function () {
      const amount = 12345    // Integer usd -> pennies = $123.45
      const currency = 'usd'  // united states dollars

      const paymentObj = {
        amount: amount,
        currency: currency,
      }

      const noAmountPayment = {
        currency: currency
      }

      const invalidCurrency = {
        amount: amount,
        currency: 'xxx'
      }

      it('return a single stripe object', async function () {
        const response = await request(app)
          .post(`${baseUrl}/intents`)
          .send(paymentObj)
          .expect(200);
        const stripeObj = response.body;
        expect(stripeObj).to.be.an.instanceOf(Object);
        expect(stripeObj).to.not.be.an.instanceOf(Array)
      });

      it('return a stripe object with payment secret', async function () {
        const response = await request(app)
          .post(`${baseUrl}/intents`)
          .send(paymentObj)
          .expect(200);        
        const stripeObj = response.body;
        expect(stripeObj).to.have.ownProperty('clientSecret');        
      });

      it('called with no amount', async function () {
        return await request(app)
          .post(`${baseUrl}/intents`)
          .send(noAmountPayment)
          .expect(400);
      });

      it('called with invalid currency', async function () {
        return await request(app)
          .post(`${baseUrl}/intents`)
          .send(invalidCurrency)
          .expect(400);
      });

    })

  })

}

module.exports = testPayments;