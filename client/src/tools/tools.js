const rootStart = process.env.REACT_APP_DEVROOT;
const pgHost = process.env.REACT_APP_PGHOST;
const serverPort = process.env.REACT_APP_SERVER_PORT;
const apiPath = process.env.REACT_APP_API;
const clientPort = process.env.REACT_APP_CLIENT_PORT;

const clientBaseUrl = `${rootStart}${pgHost}:${clientPort}`;
const baseApi = `${rootStart}${pgHost}:${serverPort}${apiPath}`;

const imageBaseUrl = '/images/';

// Create our number formatter.
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

const asMoney = (num) => {
  return (Math.round((num + Number.EPSILON) * 100) / 100);
}

/**
 * converts a monet amount 123.45 to int in smallest currency units
 * by multipling by 100 and rounding to nearest int
 * num = 123.45 will return 12345
 *
 * @param {Decimal} num
 * @return {Int} 
 */
const moneyToSCU = (num) => {
  return Math.round(num * 100)
}

const minDollors = asMoney(0.50);
const minCents = moneyToSCU(minDollors);

module.exports = {  
  clientBaseUrl,
  baseApi,
  imageBaseUrl,
  formatter,
  asMoney,
  moneyToSCU,
  minDollors,
  minCents
};