const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');


/**
 * Retrieves addresses and private keys for the corresponding address
 * 
 * @param {String} mnemonic Mnemonic words
 * @param {Number} index Index of the wallet (Default 0)
 * @returns `{address, privateKey}`
 */
function getAddressAndPrivateKeyFromMnemonic(mnemonic, index = 0) {
    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
    let path = "m/44'/60'/0'/0/" + index;
    let wallet = hdwallet.derivePath(path).getWallet();
    let address = wallet.getAddressString();
    let privateKey = wallet.getPrivateKey();

    console.log('Address:', wallet.getAddressString());
    console.log('Private key:'+privateKey.length, privateKey, realtypeof(privateKey));

    return { address, privateKey };
}

var realtypeof = function (obj) {
    switch (typeof(obj)) {
        // object prototypes
        case 'object':
            if (obj instanceof Array)
                return '[object Array]';
            else if (obj instanceof Date)
                return '[object Date]';
            else if (obj instanceof RegExp)
                return '[object regexp]';
            else if (obj instanceof String)
                return '[object String]';
            else if (obj instanceof Number)
                return '[object Number]';
            else if (obj instanceof Uint8Array)
                return '[object Uint8Array]';
            else
                return 'object';
        // object literals
        default:
            return typeof(obj);
    }   
};


module.exports = {
    getAddressAndPrivateKeyFromMnemonic: getAddressAndPrivateKeyFromMnemonic
}
