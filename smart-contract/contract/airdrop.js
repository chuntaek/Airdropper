const AIRDROP_CONTRACT_ABI = require('../abi/airdropAbi');
const TxnUtils = require('../tx-utils');
const Contract = require('./contract');


/**
 * API to interact with Airdrop smart contract.
 * See the contract for details.
 */
class Airdrop extends Contract {
    constructor(address) {
        super(address, AIRDROP_CONTRACT_ABI);
    }

    /**
     * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
     */
    pause(sender) {
        let tx = this.contract.methods.pause().encodeABI();
        return TxnUtils.signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
     */
    unpause(sender) {
        let tx = this.contract.methods.unpause().encodeABI();
        return TxnUtils.signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * Sets the hash root of incentives and unpaused the contract.
     * The contract should be already paused to be able to call this function.
     * 
     * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
     * @param {Uint8Array} roothash Roothash of the airdrop incentives
     */
    setIncentives(sender, roothash) {
        let tx = this.contract.methods.setIncentives(roothash).encodeABI();
        return TxnUtils.signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * Claims the incentive
     * 
     * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
     * @param {number} index Index of the address claiming
     * @param {number} amount Amount of token to be claimed
     * @param {Array<Uint8Array>} merkleProof Merkle Tree Proof for the given input and claimer
     */
    claim(sender, index, amount, merkleProof) {
        let tx = this.contract.methods.claim(index, amount, merkleProof).encodeABI();
        return TxnUtils.signAndSendTransaction(this.address, sender, 0, tx);
    }

    /**
     * Checks whether the incentive with the given index is already claimed or not
     * 
     * @param {number} index Index of the address to be checked
     * @return {Promise<boolean>} Resolves with true if it is already claimed, false otherwise
     */
    isClaimed(index) {
        return this.contract.methods.isClaimed(index).call();
    }

    /**
     * @return {Promise<string>} roothash
     */
    getIncentiveRoothash() {
        return this.contract.methods.incentiveRoothash().call();
    }

    /**
     * @return {Promise<string>} version
     */
    getVersion() {
        return this.contract.methods.version().call();
    }

    /**
     * @return {Promise<boolean>}
     */
    isAdmin(address) {
        return this.contract.methods.isAdmin(address).call();
    }

    /**
     * @return {Promise<boolean>}
     */
    isPaused() {
        return this.contract.methods.paused().call();
    }
}

module.exports = Airdrop;
