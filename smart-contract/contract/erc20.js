const ERC20_TOKEN_ABI = require('../abi/erc20-token-abi');
const signAndSendTransaction = require('../tx-utils').signAndSendTransaction;
const Contract = require('./contract');


class ERC20 extends Contract {
    constructor(addr, abi) {
        super(addr, abi ? abi : ERC20_TOKEN_ABI);
    }

    /**
     * @returns {Promise} Resolves with the decimals of this token
     */
    getDecimals() {
        return this.contract.methods.decimals().call();
    }

    /**
     * @returns {Promise} Resolves with the total supply of this token
     */
    totalSupply() {
        return this.contract.methods.totalSupply().call();
    }

    /**
     * @param {string} addr
     * @returns {Promise} Resolves with the balance of the address
     */
    balanceOf(addr) {
        return this.contract.methods.balanceOf(addr).call();
    }

    /**
     * Returns the amount of tokens that the owner allowed to a spender.
     * 
     * @param {string} owner The address which owns the funds
     * @param {string} spender The address which will spend the funds
     * @returns {Promise} Resolves with the amount of allowance
     */
    allowance(owner, spender) {
        return this.contract.methods.allowance(owner, spender).call();
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} to Address of the receipent
     * @param {number} amount Amount of token to be transffered
     * @return {Promise} Resolves with the receipt of the transaction
     */
    transfer(sender, to, amount) {
        let tx = this.contract.methods.transfer(to, amount).encodeABI();
        return signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} from Address of the token owner
     * @param {string} to Address of the receipent
     * @param {number} amount Amount of token to be transffered
     * @return {Promise} Resolves with the receipt of the transaction
     */
    transferFrom(sender, from, to, amount) {
        let tx = this.contract.methods.transferFrom(from, to, amount).encodeABI();
        return signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} spender Address of the spender
     * @param {number} allowance Amount of token to be allowed
     * @return {Promise} Resolves with the receipt of the transaction
     */
    approve(sender, spender, allowance) {
        let tx = this.contract.methods.approve(spender, allowance).encodeABI();
        return signAndSendTransaction(this.address, sender, 0, tx);
    }
}

module.exports = ERC20;
