const BigNumber = require('bignumber.js');
const Airdrop = require('../contract/airdrop');
const Config = require('../../config.json');

const airdrop = new Airdrop(Config.AIRDROP_CONTRACT_ADDRESS);


/**
 * In order to update only one of address&abi,
 * just pass the other parameter as null or
 * empty string.
 * 
 * @param {string} addr 
 * @param {object} abi 
 */
function updateContract(addr, abi) {
    airdrop.updateContract(addr, abi);
}

/**
 * @param {{address:string, privateKey:string}} sender Public&Private keys of the sender
 * @param {{fee:number, limit:number}} gasOptions
 * @returns {Promise} Resolves with the mined txn object
 */
function pause(sender, gasOptions) {
    return airdrop.pause(sender).gasOptions(gasOptions);
}

/**
 * @param {{address:string, privateKey:string}} sender Public&Private keys of the sender
 * @param {{fee:number, limit:number}} gasOptions
 * @returns {Promise} Resolves with the mined txn object
 */
function unpause(sender, gasOptions) {
    return airdrop.unpause(sender).gasOptions(gasOptions);
}

/**
 * Sets the hash root of incentives and unpaused the contract.
 * The contract should be already paused to be able to call this function.
 * 
 * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
 * @param {Uint8Array} roothash Roothash of the airdrop incentives
 * @param {{fee:number, limit:number}} gasOptions
 * @returns {Promise} Resolves with the mined txn object
 */
function setIncentives(sender, roothash, gasOptions) {
    return airdrop.setIncentives(sender, roothash).gasOptions(gasOptions);
}

/**
 * Claims the incentive
 * 
 * @param {{address:string, privateKey:string}} sender Public&Private keys of sender
 * @param {number} index Index of the address claiming
 * @param {number} amount Amount of token to be claimed
 * @param {Array<Uint8Array>} merkleProof Merkle Tree Proof for the given inputs
 * @param {{fee:number, limit:number}} gasOptions
 * @returns {Promise} Resolves with the mined txn object
 */
function claim(sender, index, amount, merkleProof, gasOptions) {
    return airdrop.claim(sender, index, amount, merkleProof).gasOptions(gasOptions);
}

/**
 * Checks whether the incentive with the given index is already claimed or not
 * 
 * @param {number} index Index of the address to be checked
 * @return {Promise<boolean>} Resolves with true if it is already claimed, false otherwise
 */
function isClaimed(index) {
    return airdrop.isClaimed(BigNumber(index));
}

/**
 * @returns {Promise<string>} Resolves with the current version of redeem table
 */
function getVersion() {
    return airdrop.getVersion();
}

/**
 * @return {Promise<string>} roothash
 */
function getIncentiveRoothash() {
    return airdrop.getIncentiveRoothash();
}

/**
 * @returns {string} Address of this contract
 */
function getContractAddress() {
    return airdrop.address;
}

/** 
 * @param {string} address 
 * @returns {Promise<boolean>}
 */
function isAdmin(address) {
    return airdrop.isAdmin(address);
}

/**
 * @returns {Promise<boolean>}
 */
function isPaused() {
    return airdrop.isPaused();
}


module.exports = {
    updateContract: updateContract,
    pause: pause,
    unpause: unpause,
    setIncentives: setIncentives,
    claim: claim,
    isClaimed: isClaimed,
    isAdmin: isAdmin,
    isPaused: isPaused,
    getVersion: getVersion,
    getIncentiveRoothash: getIncentiveRoothash,
    getContractAddress: getContractAddress
};