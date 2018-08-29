const EthjsTxn = require('ethereumjs-tx');
const EthjsUtils = require('ethereumjs-util');
const EthjsWallet = require('ethereumjs-wallet');
const web3 = require('./web3-utils').web3;


// TODO: Confirm this with gas analysis of smart contracts   
const DEFAULT_GAS_LIMIT = 200000;
const DEFAULT_GAS_PRICE = 21e9;
// TODO: Make network id configurable (testnet/mainnet)
const NETWORK_ID = 4;
const TX_TRIAL_INTERVAL = 10000;


/**
 * Creates a raw transaction object
 * 
 * @param {ByteString} to Sender's address
 * @param {ByteString} from Recipient's address
 * @param {Object} gasOptions `{price, limit}` Gas options which includes gas price and gas limit
 * @param {Number} nonce Nonce of the transaction
 * @param {Number} value Amount of ether to be sent along (in wei)
 * @param {ByteString} data Data to be send through this transaction
 * @returns {Object} Raw transaction object
 */
function createRawTx(to, from, gasOptions = { price: DEFAULT_GAS_PRICE, limit: DEFAULT_GAS_LIMIT }, nonce, value, data) {
    console.log(`TO: ${to} FROM: ${from} Gas price: ${gasOptions.price} Gas limit: ${gasOptions.limit} Value: ${value} Nonce: ${nonce}, Data: ${data}`);
    console.log(`Hex gas price: ${web3.utils.toHex(gasOptions.price.toString(10))}`);
    console.log(`Hex gas limit: ${web3.utils.toHex(gasOptions.limit.toString(10))}`); 
    console.log(`Value: ${web3.utils.toHex(value.toString(10))}`);
    console.log(`Nonce: ${web3.utils.toHex(nonce.toString(10))}`);
    return {
        chainId: NETWORK_ID,
        gasPrice: web3.utils.toHex(gasOptions.price.toString(10)),
        gasLimit: web3.utils.toHex(gasOptions.limit.toString(10)),
        to: to,
        from: from,
        value: web3.utils.toHex(value.toString(10)),
        nonce: web3.utils.toHex(nonce.toString(10)),
        data: data
    };
}

/**
 * Creates a signed transaction
 * 
 * @param {ByteString} to Address of the recipient
 * @param {ByteString} privateKey Private key of the wallet
 * @param {Object} gasOptions `{price, limit}` Gas options which includes gas price and gas limit
 * @param {Number} nonce Nonce of the transaction
 * @param {ByteString} data Data to be send through this transaction
 * @returns {Buffer} RLP encoding of the signed transaction
 */
function createSignedTx(to, privateKey, gasOptions, nonce, value, data) {
    // Get an instance of wallet from the private key 
    let wallet = EthjsWallet.fromPrivateKey(EthjsUtils.toBuffer(privateKey));
    // Create a transaction object
    let tx = new EthjsTxn(createRawTx(to, wallet.getAddressString(), gasOptions, nonce, value, data));
    // And sign the transaction
    tx.sign(wallet.getPrivateKey());

    return tx.serialize().toString('hex');
}

/**
 * Signs and sends the transaction
 * 
 * @param {ByteString} to Address of the recipient
 * @param {Object} sender `{address, privateKey}` Sender of the this transaction
 * @param {Object} gasOptions `{price, limit}` Gas options which includes gas price and gas limit
 * @param {Nubmer} value Ether value to be sent along
 * @param {ByteString} txData Transaction data
 * @returns {Promise} Receipt of the transaction or error
 */
function promisifiedSignAndSendTransaction(to, sender, gasOptions, value, txData) {
    return new Promise((resolve, reject) => {
        let lastTxHash = '';
        // Get the transaction count of this address, in order to
        // use it as a nonce for transactions made by this address
        web3.eth.getTransactionCount(sender.address, (e, count) => {
            if (e) {
                console.log(`getTransactionCount => ${e}`);
                reject(e);
            }

            let signedTx = createSignedTx(to, sender.privateKey, gasOptions, count, value, txData);

            if (!signedTx) {
                reject(new Error('signAndSendTransaction => Empty transaction!'));
            }

            // And send the transaction to the network
            web3.eth.sendSignedTransaction(`0x${signedTx}`, (e, txHash) => {
                lastTxHash = '';
                if (e) {
                    console.log(`signAndSendTransaction => ${e} txHash: ${txHash}`);
                    reject(e);
                }
            })
                .on('error', e => {
                    waitForReceipt(e, lastTxHash)
                        .then(receipt => {
                            lastTxHash = '';
                            resolve(receipt);
                        })
                        .catch(err => reject(err));
                })
                .once('transactionHash', hash => { lastTxHash = hash; })
                .then(receipt => {
                    lastTxHash = '';

                    // Check the status field of receipt if the tx is rejeceted or succeeded
                    if (parseInt(receipt.status, 16)) {
                        resolve(receipt);
                    } else {
                        reject(new Error('signAndSendTransaction => Transaction has been reverted!'));
                    }
                })
                .catch(e => {
                    waitForReceipt(e, lastTxHash)
                        .then(receipt => {
                            lastTxHash = '';
                            resolve(receipt);
                        })
                        .catch(err => reject(err));
                });
        });
    });
}

/**
 * Checks if the given error is 'not mined within 50 blocks' error.
 * If it is so, requests the receipt of the transaction with given tx hash.
 * And keeps requeting the receipt until it gets.
 * 
 * @param {Error} e Error object passed from the caller
 * @param {ByteString} lastTxHash 
 * @returns {Promise} Receipt of the transaction or an error
 */
// FIXME: This is a temproray workaround. Try to migrate web3 version >= beta-31
// https://github.com/ethereum/web3.js/issues/1102
// TODO: Add timeout or do not wait for receipt
function waitForReceipt(e, lastTxHash) {
    let handle;
    return new Promise((resolve, reject) => {
        if (e !== undefined && e.toString().includes('not mined within 50 blocks')) {
            handle = setInterval(() => {
                if (lastTxHash == '') {
                    clearInterval(handle);
                    reject(new Error('signAndSendTransaction => Transaction wasn\'t mined!'));
                }
                console.log('Call getTransactionReceipt() again');
                web3.eth.getTransactionReceipt(lastTxHash)
                    .then(receipt => {
                        if (receipt != null && receipt.blockNumber > 0) {
                            clearInterval(handle);
                            if (parseInt(receipt.status, 16)) {
                                resolve(receipt);
                            } else {
                                reject(new Error('signAndSendTransaction => Transaction has been reverted!'));
                            }
                        }
                    })
                    .catch(err => console.error(err));
            }, TX_TRIAL_INTERVAL);
        } else {
            reject(e);
        }
    });
}

/**
 * Wrapper function in order to set gas options separately (chained) 
 * 
 * @param {ByteString} to Address of the recipient
 * @param {Object} sender `{address, privateKey}` Sender of the this transaction
 * @param {Nubmer} value Ether value to be sent along
 * @param {ByteString} txData Transaction data
 * @returns {Function} `promisifiedSignAndSendTransaction` A promisified function to sign and send the transaction 
 */
function signAndSendTransaction(to, sender, value, txData) {
    return {
        gasOptions: function (options) {
            return promisifiedSignAndSendTransaction(to, sender, options, value, txData);
        }
    }
}

/**
 * Calculates the transaction cost with the given gas options in ether
 * 
 * @param {Number|BigNubmer|String} gasPrice Price of one gas unit in Gwei
 * @param {Number|BigNubmer|String} gasAmount Amount of gas to be spent
 * @returns {Number} Cost of the transaction in ether
 */
function txnCost(gasPrice, gasAmount) {
    let priceInWei = web3.utils.toWei(`${gasPrice}`, 'gwei');
    return Number(web3.utils.fromWei(`${priceInWei}`, 'ether')) * Number(gasAmount);
}


module.exports = {
    signAndSendTransaction: signAndSendTransaction,
    txnCost: txnCost,
    web3: web3
}
