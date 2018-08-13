const web3Utils = require('web3-utils');

/**
 * 
 * @param {Array<{address:balance}>} balances Array of address-balance pair to be airdropped
 */
function AirDropper(balances) {
    if (!(this instanceof AirDropper)) { 
        throw new Error('missing new');
    }

    this.balances = balances;
    this.rootHash = computeRootHash(balances);
}

AirDropper.prototype.updateRootHash = function(balances) {
    this.balances = balances;
    this.rootHash = computeRootHash(balances);
}

AirDropper.prototype.getRootHash = function() {
    return this.rootHash;
}

AirDropper.prototype.getIndex = function(address) {
    address = address.toLowerCase();

    let leaves = expandLeaves(this.balances);

    for (let i = 0; i < leaves.length; i++) {
        if (i != leaves[i].index) { 
            throw new Error('Fatal: Index data and index of the address in the data array do not match!'); 
        }
        if (leaves[i].address === address) { 
            return leaves[i].index; 
        }
    }

    throw new Error('address not found');
}

AirDropper.prototype.getAddress = function(index) {
    let leaves = expandLeaves(this.balances);
    return leaves[index].address;
}

AirDropper.prototype.getBalance = function(index) {
    let leaves = expandLeaves(this.balances);
    return leaves[index].balance;
}

AirDropper.prototype.getMerkleProof = function(index) {
    return computeMerkleProof(this.balances, index);
}

AirDropper.prototype.verifyMerkleProof = function(index, address, amount, merkleProof) {
    // Compute the hash of the data leaf
    let node = web3Utils.soliditySha3(index, address, amount)
    
    let path = index;
    for (let i = 0; i < merkleProof.length; i++) {
        
        // Compute the hash of the node. Order of hasing is important!
        if ((path & 1) == 1) {
            // If the current node is an even node, it must be hashed from right
            node = web3Utils.soliditySha3(merkleProof[i], node);
        } else {
            // If the current node is an odd node, it must be hashed from left
            node = web3Utils.soliditySha3(node, merkleProof[i]);
        }
        // Move to upper level in the tree
        path /= 2;
    }

    return node == this.rootHash;
}


/******************* Pure functions *******************/

/**
 * Creates an formatted/ordered data-set from the given data-set
 * 
 * @param {Array<{address:balance}>} balances Data-set to be formatted
 * @returns {Array<{address, balance, index}>} Formatted/Ordered data-set
 */
function expandLeaves(balances) {
    let addresses = Object.keys(balances);

    return addresses.map(function(addr, i) { return { index: i, address: addr, balance: balances[addr] }; });
}

/**
 * Calculates the hash of each tree in the given data-set
 * 
 * @param {Array<{address:balance}>} balances Data-set to be hashed
 * @returns {Array<string>} Array of hashed data-set
 */
function getLeaves(balances) {
    let leaves = expandLeaves(balances);
    return leaves.map(function(leaf) {
        // The order of the parameters are important!!!
        // It is implemented in this order in Smart-Contract!!!
        return web3Utils.soliditySha3(leaf.index, leaf.address, leaf.balance);
    });
}

/**
 * Reduces Merkle Tree by one level
 * 
 * @param {Array<string>} leaves Leaves of the tree to be reduced by one level
 */
function reduceMerkleTree(leaves) {
    let output = [];

    while (leaves.length) {
        let left = leaves.shift();
        // if the length of leaves is odd, fill the last right-leaf with the last left-leaf
        let right = (leaves.length === 0) ? left: leaves.shift();
        output.push(web3Utils.soliditySha3(left, right));
    }

    // Copy the recuded tree back to the input
    output.forEach(function(leaf) {
        leaves.push(leaf);
    });
}

/**
 * Calculates the root hash of the given data-set
 * according to Merkle Tree
 * ```
 *          ㅁ        (root hash)
 *       /     \
 *     ㅁ       ㅁ     (level-1)
 *    /  \    /  \
 *   ㅁ  ㅁ   ㅁ   ㅁ   (level-2)
 *  .    .   .     .      .
 *  .    .   .     .      .
 * .. .. .. .. .. ..  (level-n) 
 * ```
 * @param {Array<{address:balance}>} balances Array of data to be hash-proofed
 */
function computeRootHash(balances) {
    let leaves = getLeaves(balances);

    // In each iteration, the length of the leaves will be halved
    while (leaves.length > 1) {
        reduceMerkleTree(leaves);
    }
    return leaves[0];
}

/**
 * Calculates the merkle tree proof for the given index
 * from the given balances array.
 * 
 * @param {Array} balances `[{address: balance},...]` Array of data to be hash-proofed
 * @param {number} index Index(0-based) of the data to be looked for
 * @returns {Byte32String} Merkle tree proof
 */
function computeMerkleProof(balances, index) {
    let leaves = getLeaves(balances);

    if (index == null) { 
        throw new Error('address not found'); 
    }

    let path = index;
    let nextNode;
    let proof = [];
    while (leaves.length > 1) {
        // If the index is odd, take node before the current node
        // otherwise, take the node after the current node
        nextNode = (path % 2) == 1 
                ? leaves[path - 1] 
                : leaves[path + 1];

        // Check whether the next node is available or not
        // If it does not exit (which means that the number of
        // nodes in the current tree level is odd and the last
        // node should be hashed with itself), just push the
        // current node to the proof array. 
        // Otherwise, just use the next node.
        if (nextNode === undefined || nextNode == null) {
            proof.push(leaves[path]);
        } else {
            proof.push(nextNode);
        }
        
        // Reduce the merkle tree by one level
        reduceMerkleTree(leaves);

        // Move up
        path = parseInt(path / 2);
    }
    
    return proof;
}


module.exports = AirDropper;
