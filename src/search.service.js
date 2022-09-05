/**
 * Connect to the database and search using a criteria.
 */
"use strict";
const dbMongoAtlas = require('../db/database');

/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findAll() {
    const client = (await dbMongoAtlas.getDb()).client;
    const collection = (await dbMongoAtlas.getDb()).collection;
    const res = await collection.find().toArray();

    await client.close();

    return res;
}

/**
 * Creates new document in collection
 *
 * @async
 * @param {array} data        Data to create the new document
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function createNewDocument(data) {
    const client = (await dbMongoAtlas.getDb()).client;
    const collection = (await dbMongoAtlas.getDb()).collection;
    const res = await collection.insertOne(data);

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
async function updateDocument(filter, data) {
    const client = (await dbMongoAtlas.getDb()).client;
    const collection = (await dbMongoAtlas.getDb()).collection;
    const res = await collection.updateOne(filter, data);

    await client.close();

    return res;
}

async function getAllFiles() {
    // Find using await
    try {
        let res = await findAll();

        console.log(res);
        return res;
    } catch (err) {
        console.log(err);
    }
}

async function createNewFile(fileData) {
    // Find using await
    try {
        let res = await createNewDocument(fileData);

        console.log(res);
        return res;
    } catch (err) {
        console.log(err);
    }

}

async function updateFile(newFileData, fileId) {
    // Find using await
    try {
        let res = await updateDocument(fileId, newFileData);

        console.log(res);
        return res;
    } catch (err) {
        console.log(err);
    }
}

module.exports = {getAllFiles, createNewFile, updateFile}