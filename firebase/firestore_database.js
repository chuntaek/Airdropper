const admin = require("firebase-admin");

/**
 * @see https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference#get
 *
 * @param {firebase.firestore.DocumentReference} docRef
 */
function getRecord(docRef) {
    return new Promise((resolve, reject) => {
        if (docRef === undefined
            || docRef.get === undefined
            || !(docRef.get instanceof Function)) {
            reject('Invalid document reference!');
        }

        docRef.get()
            .then(record => {
                if (!record.exists) {
                    reject('No record has been found in the provided document reference!');
                }

                resolve(record);
            })
            .catch(e => reject(e));
    });
}

/**
 * @see https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference#set
 *
 * @param {firebase.firestore.DocumentReference} docRef
 * @param {object} data Data fields to be updated
 * @param {!boolean} merge If sets to true, replace only the values specified in the data argument. Fields omitted will remain untouched.
 */
function setRecord(docRef, data, merge) {
    return new Promise((resolve, reject) => {
        if (docRef === undefined
            || docRef.set === undefined
            || !(docRef.set instanceof Function)) {
            reject('Invalid document reference!');
        }

        if (data == null) {
            reject('Data cannot be null!');
        }

        docRef.set(data, { merge })
            .then(() => resolve())
            .catch(e => reject(e));
    });
}

/**
 * @see https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference#update
 *
 * @param {firebase.firestore.DocumentReference} docRef
 * @param {object} data Data fields to be updated
 */
function updateRecord(docRef, data) {
    return new Promise((resolve, reject) => {
        if (docRef === undefined
            || docRef.update === undefined
            || !(docRef.update instanceof Function)) {
            reject('Invalid document reference!');
        }

        docRef.update(data)
            .then(() => resolve())
            .catch(e => reject(e));
    });
}

/**
 * @see https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference#delete
 *
 * @param {firebase.firestore.DocumentReference} docRef
 */
function deleteRecord(docRef) {
    return new Promise((resolve, reject) => {
        if (docRef === undefined
            || docRef.delete === undefined
            || !(docRef.delete instanceof Function)) {
            reject('Invalid document reference!');
        }

        docRef.delete()
            .then(() => resolve())
            .catch(e => reject(e));
    });
}

/**
 * Creates a document reference on Firestore DB
 *
 * @param {string} collectionRef
 * @param {string} docRef
 * @returns {firebase.firestore.DocumentReference}
 */
function createDocRef(collectionRef, docRef) {
    return admin.firestore().collection(collectionRef).doc(docRef);
}

/**
 * Creates a collection reference on Firestore DB
 *
 * @param {string} ref Reference to the collection
 * @returns {firebase.firestore.CollectionReference}
 */
function createCollectionRef(ref) {
    return admin.firestore().collection(ref);
}

function findAllByPhone(collectionRef, phone) {
    return new Promise((resolve, reject) => {
        collectionRef.where('phone', '==', phone).get()
            .then(snapshots => resolve(snapshots))
            .catch(e => reject(e));
    });
}

module.exports ={
    createCollectionRef: createCollectionRef,
    createDocRef: createDocRef,
    setRecord: setRecord,
    updateRecord: updateRecord,
    getRecord: getRecord,
    deleteRecord: deleteRecord
}
