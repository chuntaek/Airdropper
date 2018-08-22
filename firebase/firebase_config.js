const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Target list 'PROD' and 'DEV'
const baseConfig = 'DEV';
const isProd = conf => (conf == 'PROD');

const serviceAccount = (isProd(baseConfig)) ?
    require("./service_account.json") :
    require("./service_account_dev.json");

const storageUrl = (isProd(baseConfig)) ?
    "firestore-sovereignwallet.appspot.com" :
    "firestore-sovereignwallet-d.appspot.com";

const dbUrl = (isProd(baseConfig)) ?
    "https://firestore-sovereignwallet.firebaseio.com" :
    "https://firestore-sovereignwallet-d.firebaseio.com";

const initAdmin = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageUrl,
        databaseURL: dbUrl
    });
};

module.exports = {
    storageUrl, dbUrl,
    admin, functions, initAdmin
}
