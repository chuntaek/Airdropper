const BigNumber = require('bignumber.js');
const isValidAddress = require('ethereumjs-util').isValidAddress;
const ERC20Token = require('../contract/erc20');


/**
 * Interface to interact with ERC20 compliant token contracts
 */
class ERC20TokenApi {
    constructor(addr, abi, decimals = 0) {
        this.token = new ERC20Token(addr, abi);
        this.decimals = decimals;
        this.oneToken = new BigNumber(Math.pow(10, this.decimals));
    }

    getAddress() {
        return this.token.address;
    }

    /**
     * @returns {Promise} Resolves with the total supply of this token
     */
    totalSupply() {
        return new Promise((resolve, reject) => {
            this.token.totalSupply()
                .then(supply => {
                    let totalSupply = BigNumber(supply).div(this.oneToken);
                    resolve(totalSupply);
                })
                .catch(e => reject(e));
        });
    }

    /**
     * @param {string} addr
     * @returns {Promise} Resolves with the balance of the address
     */
    balanceOf(addr) {
        return new Promise((resolve, reject) => {
            this.token.balanceOf(addr)
                .then(balance => {
                    let balanceof = BigNumber(balance).div(this.oneToken);
                    resolve(balanceof);
                })
                .catch(e => reject(e));
        });
    }

    /**
     * @returns {Promise} Resolves with the decimals of this token
     */
    getDecimals() {
        return this.token.getDecimals();
    }

    /**
     * Returns the amount of tokens that the owner allowed to a spender.
     * 
     * @param {string} owner The address which owns the funds
     * @param {string} spender The address which will spend the funds
     * @returns {Promise} Resolves with the amount of allowance
     */
    allowance(owner, spender) {
        return new Promise((resolve, reject) => {
            this.token.allowance(owner, spender)
                .then(allowance => {
                    let alw = BigNumber(allowance).div(this.oneToken);
                    resolve(alw);
                })
                .catch(e => reject(e));
        });
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} to Address of the receipent
     * @param {number} amount Amount of token to be transffered
     * @return {Promise} Resolves with the receipt of the transaction
     */
    transfer(sender, to, amount, gasOptions) {
        if (!isValidAddress(to)) {
            throw new Error(`${to} is not a valid Ethereum address!`);
        }

        let tokenAmount = BigNumber(amount).times(this.oneToken);
        return this.token.transfer(sender, to, tokenAmount).gasOptions(gasOptions);
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} from Address of the token owner
     * @param {string} to Address of the receipent
     * @param {number} amount Amount of token to be transffered
     * @return {Promise} Resolves with the receipt of the transaction
     */
    transferFrom(sender, from, to, amount) {
        if (!isValidAddress(to)) {
            throw new Error(`${to} is not a valid Ethereum address!`);
        }

        let tokenAmount = BigNumber(amount).times(this.oneToken);
        return this.token.transferFrom(sender, from, to, tokenAmount).gasOptions(gasOptions);
    }

    /**
     * @param {{address:string, privateKey:Uint8Array}} sender
     * @param {string} spender Address of the spender
     * @param {number} allowance Amount of token to be allowed
     * @return {Promise} Resolves with the receipt of the transaction
     */
    approve(sender, spender, allowance, gasOptions) {
        if (!isValidAddress(spender)) {
            throw new Error(`${spender} is not a valid Ethereum address!`);
        }
        let tokenAmount = BigNumber(allowance).times(this.oneToken);
        return this.token.approve(sender, spender, tokenAmount).gasOptions(gasOptions);
    }
}


module.exports = ERC20TokenApi;
