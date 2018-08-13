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
    console.log('Private key:', wallet.getPrivateKeyString());

    return { address, privateKey };
}


module.exports = {
    getAddressAndPrivateKeyFromMnemonic: getAddressAndPrivateKeyFromMnemonic
}
