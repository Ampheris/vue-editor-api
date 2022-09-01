/**
 * Connect to the database and search using a criteria.
 */
"use strict";

const mongo = require("mongodb").MongoClient;
const dsn = process.env.DBWEBB_DSN || "mongodb://localhost:27017/mumin";
const collectionName = 'texteditorFiles';


/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {object} criteria   Search criteria.
 * @param {object} projection What to project in results.
 * @param {number} limit      Limit the number of documents to retrieve.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findAll(dsn, colName) {
    const client = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find().toArray();

    await client.close();

    return res;
}

/**
 * Creates new document in collection
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {array} data        Data to create the new document
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function createNewDocument(dsn, colName, data) {
    const client = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.insertOne(data);

    await client.close();

    return res;
}

/**
 * Updates new document in collection
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {array} data        Data to update the new document
 * @param {string} filter     Contains the id of the document to be updated.
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function updateDocument(dsn, colName, filter, data) {
    const client = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.updateOne(filter, data)

    await client.close();

    return res;
}

function getAllFiles() {
    let res = '';
    (async () => {
        // Find using await
        try {
            let res = await findAll(dsn, collectionName);

            console.log(res);
        } catch (err) {
            console.log(err);
        }
    })();
    return res;
}

function createNewFile(fileData) {
    let res = '';
    (async () => {
        // Find using await
        try {
            let res = await createNewDocument(dsn, collectionName, fileData);

            console.log(res);
        } catch (err) {
            console.log(err);
        }
    })();
    return res;
}

function updateFile(newFileData, fileId) {
    let res = '';
    (async () => {
        // Find using await
        try {
            res = await updateDocument(dsn, collectionName, fileId, newFileData);

            console.log(res);
        } catch (err) {
            console.log(err);
        }
    })();

    return res;
}

module.exports = {getAllFiles, createNewFile, updateFile}