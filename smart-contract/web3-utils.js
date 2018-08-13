const HttpProviders = require('./web3-providers.json');
const Web3 = require('web3');

// TODO: Make configurable (STAGING/PRODUCTION)
const httpProvider = HttpProviders.ropsten;

const web3Instance = new Web3();
web3Instance.setProvider(new web3Instance.providers.HttpProvider(httpProvider));

console.log('Provider:', httpProvider);


module.exports = {
    web3: web3Instance,
}
