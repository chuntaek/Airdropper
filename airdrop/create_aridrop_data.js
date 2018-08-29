const admin = require('firebase-admin');
const FirestoreDB = require('../firebase/firestore_database')
const airdropApi = require('../smart-contract/api/airdropApi');
const Airdropper = require('../airdropper');

// initionalize firebase
const baseConfig = 'DEV';
const isProd = conf => (conf == 'PROD');
const serviceAccount = (isProd(baseConfig)) ?
    require("../firebase/service_account.json") :
    require("../firebase/service_account_dev.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// -- end.

const db = admin.firestore();

function init(Admin) {
    hasAirdropData()
        .then(async hasAirdropData => {
            if(!hasAirdropData) {
                /*
                    collection('airdrop').doc(version).collection('airdrops').doc(address).set({
                        "index": index,
                        "balance": balance,
                        "merkleProof": '',
                        "cliamed": false
                    }
                */

                const balances = await setAirdropSubRecord();
                console.log('balances', '=>', balances);

                const airDropper = new Airdropper(balances);
                const version = await getVersion();
                const data = {
                    "version": version,
                    "rootHash": airDropper.getRootHash()
                };
                console.log('Main data: ', data);

                await FirestoreDB.setRecord(FirestoreDB.createDocRef('airdrop', version), data, true);
                await updateMerkleProof(airDropper);
                console.log('Updated MerkleProof!!');

                // setAirdropSubRecord()
                //     .then(balances => {
                //         console.log('balances', '=>', balances);
                //
                //         airdropApi.getVersion()
                //             .then(version => {
                //                 const airDropper = new Airdropper(balances);
                //                 const data = {
                //                     "version": version,
                //                     "rootHash": airDropper.getRootHash()
                //                 };
                //                 console.log('data: ', data);
                //
                //                 /*
                //                     collection('airdrop').doc(version).set({
                //                         "version": version,
                //                         "rootHash": rootHash,
                //                     }
                //                  */
                //                 FirestoreDB.setRecord(FirestoreDB.createDocRef('airdrop', version), data, true)
                //                     .catch(err => console.log(err));
                //
                //                 return airDropper;
                //             })
                //             .then(airDropper => {
                //                 updateMerkleProof(airDropper)
                //                     .then(() => console.log('Updated MerkleProof!!'))
                //                     .catch(err => console.log(err));
                //
                //                 return airDropper;
                //             })
                //             .catch(err => console.log(err));
                //     })
                //     .catch(err => console.log(err));
            } else {
                console.log('Do create a airdrop data!!');
            }
        })
        .catch(err => {
            console.log("Error hasAirdropData function: ", err);
        });
}


function getVersion() {
    return new Promise((resolve, reject) => {
        airdropApi.getVersion()
            .then(version => {
                if(version === 'undefined' || version == null) {
                    reject('Error getting version: ', version);
                }

                resolve(version);
            })
            .catch(e => reject(e));
    });
}

function hasAirdropData() {
    return new Promise((resolve, reject) => {
        getVersion()
            .then(version => {
                db.collection('airdrop').doc(version).get()
                    .then(doc => {
                        if(doc === 'undefined' || doc == null) {
                            reject('No record has been found in the provided document reference!');
                        };

                        resolve(doc.exists);
                    })
                    .catch(e => reject(e));
            })
            .catch(e => reject(e));
    });
}

function setAirdropSubRecord() {
    return new Promise((resolve, reject) => {
        db.collection('kyc').get()
            .then(snapshot => {
                // if(!snapshot.exists) {
                if(snapshot === 'undefined' || snapshot == null) {
                    reject('No record has been found in the provided document reference! - setAirdropSubRecord#1');
                }

                let index = 0;
                let balances = {};
                snapshot.forEach(doc => {
                    const {uid, walletAddress} = doc.data();
                    if( (uid === 'undefined' || uid == null)
                        || (walletAddress === 'undefined' || walletAddress == null) ) {
                        reject('No record has been found in the provided document reference! - setAirdropSubRecord#2');
                    }
                    console.log('kyc: ', uid, walletAddress);


                    let balance = 20;    // KYC reward
                    getReferralReward(uid)
                        .then(reward => {
                            console.log('referralReward: ', reward);
                            balance += reward;
                        })
                        .then(() => {
                            const data = {
                                "index": index,
                                "balance": balance,  // KYC reward
                                "merkleProof": '',
                                "claimed": false
                            };
                            console.log('data: ', data);

                            /*
                                Set a airdrop sub collection
                             */
                            getVersion()
                                .then(version => {
                                    db.collection('airdrop').doc(version)
                                        .collection('airdrops').doc(walletAddress)
                                        .set(data)
                                        .catch(e => reject(e));
                                })
                                .catch(e => reject(e));
                        })
                        .catch(e => reject(e));

                    /*
                        Set a {address: balance} pair
                     */
                    balances[walletAddress] = balance;
                    index++;
                });

                resolve(balances);
            })
            .catch(e => reject(e));
    });
}

function getReferralReward(uid) {
    return new Promise((resolve, reject) => {
        if(uid === 'undefined' || uid == null) {
            reject('Invalid parameter: ', uid);
        }

        db.collection('referrals')
            .where('uid', '==', uid)
            .where('isReferred', '==', true)
            .get()
            .then(docRef => {
                console.log('docRef count: ', docRef.size);
                if(docRef === 'undefined' || docRef == null) {
                    reject('No record has been found in the provided document reference!!! - getReferralReward');
                }

                resolve(5 * docRef.size);
            })
            .catch(e => reject(e));
    });
}

function getAirdropRef() {
    // return db.collection('airdrop').doc(getVersion());

    return new Promise((resolve, reject) => {
        getVersion()
            .then(version => {
                if(db === 'undefined' || db == null) {
                    reject('Invalid firestore instance: ', db);
                }

                resolve(db.collection('airdrop').doc(version));
            })
            .catch(e => reject(e));
    });
}

function updateMerkleProof(airDropper) {
    return new Promise((resolve, reject) => {
        getAirdropRef()
            .then(airdropRef => {
                if(airdropRef === 'undefined' || airdropRef == null) {
                    reject('No record has been found in the provided document reference! - updateMerkleProof#1');
                }

                airdropRef.collection('airdrops').get()
                    .then(airdropSubRef => {
                        if(airdropSubRef === 'undefined' || airdropSubRef == null) {
                            reject('No record has been found in the provided document reference! - updateMerkleProof#2');
                        }

                        console.log("doc size: ", airdropSubRef.size);
                        airdropSubRef.forEach(doc => {
                            const address = doc.id;
                            // const {index} = doc.data();
                            const index = airDropper.getIndex(address);
                            const merkleProof = airDropper.getMerkleProof(index);
                            console.log(index, 'merkelProof: ', merkleProof);

                            if(address === 'undefined' || address == null
                                || index === 'undefined' || index == null
                                || merkleProof === 'undefined' || merkleProof == null) {
                                reject('Invalid document reference!');
                            }

                            airdropRef.collection('airdrops').doc(address)
                                .update({
                                    "merkleProof": merkleProof
                                })
                                .then(() => resolve())
                                .catch(e => reject(e));
                        });
                    })
                    .catch(e => reject(e));
            })
            .catch(e => reject(e));
    });
}

module.exports = {
    init: init
};