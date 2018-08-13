const web3 = require('../web3-utils').web3;


class Contract {
    constructor(addr, abi) {
        if (!addr) { 
            throw new Error('Contract address shouldn\'t be empty!'); 
        }

        if (!abi) { 
            throw new Error('Contract ABI shouldn\'t be empty!'); 
        }

        this.address = addr;
        this.abi = abi;

        // Create an instance of the contract
        this.contract = new web3.eth.Contract(this.abi, this.address);
    }

    /**
     * In order to update only one of address&abi,
     * just pass the other parameter as null or
     * empty string.
     * 
     * @param {string} addr 
     * @param {object} abi 
     */
    updateContract(addr, abi) {
        if (addr) {
            this.address = addr;
        }

        if (abi) {
            this.abi = abi;
        }

        this.contract = new web3.eth.Contract(this.abi, this.address);
    }
}

module.exports = Contract;
