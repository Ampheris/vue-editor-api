/**
 * Connect to the database and search using a criteria.
 */
"use strict";
const dbMongoAtlas = require('../db/database');
const ObjectId = require('mongodb').ObjectId;

/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findAll(userId) {
    const client = (await dbMongoAtlas.getDb('permission')).client;
    const collection = (await dbMongoAtlas.getDb('permission')).collection;
    let user = new ObjectId(userId);
    let res = await collection.find({userRef: user}).toArray();

    let data = res.flatMap((dict) => {
        return dict.documentRef;
    });

    res = await getUserSpecificDoc(data);

    await client.close();

    return res;
}

async function getUserSpecificDoc(data) {
    const client = (await dbMongoAtlas.getDb('document')).client;
    const collection = (await dbMongoAtlas.getDb('document')).collection;
    const res = await collection.find({_id: {$in: data}}).toArray();

    await client.close();

    return res;
}

/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function getSpecificDocument(id) {
    const client = (await dbMongoAtlas.getDb('document')).client;
    const collection = (await dbMongoAtlas.getDb('document')).collection;
    const res = await collection.findOne({_id: id},);

    await client.close();

    return res;
}

/**
 * Creates new document in collection
 *
 * @async
 * @param {array} data        Data to create the new document
 * @param {string} userId
 * @throws Error when database operation fails.
 *
 * @return
 */
async function createNewDocument(data, userId) {
    const client = (await dbMongoAtlas.getDb('document')).client;
    const collection = (await dbMongoAtlas.getDb('document')).collection;
    const res = await collection.insertOne(data);

    await addPermissionForNewDoc(userId, res.insertedId);

    await client.close();

    return res;
}

/**
 * Creates new permission in collection
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return
 * @param {string} userId
 * @param {string} documentId
 */
async function addPermissionForNewDoc(userId, documentId) {
    const client = (await dbMongoAtlas.getDb('permission')).client;
    const collection = (await dbMongoAtlas.getDb('permission')).collection;
    let data = {
        'userRef': userId,
        'documentRef': documentId,
        'permission': 'admin'
    }

    const res = await collection.insertOne(data);

    await client.close();

    return res;
}

/**
 * Adds a user to an invitation list in collection
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return
 * @param {string} email
 * @param {string} documentId
 */
async function addUserToInviteList(email, documentId) {
    const client = (await dbMongoAtlas.getDb('invitation')).client;
    const collection = (await dbMongoAtlas.getDb('invitation')).collection;
    let data = {
        'email': email,
        'documentRef': documentId,
        'permission': 'moderator'
    }

    const res = await collection.insertOne(data);

    await client.close();

    return res;
}

/**
 * Adds permission to user if it has en pending invitation
 *
 * @async
 * @throws Error when database operation fails.
 *
 * @return
 * @param {string} email
 * @param {string} userId
 */
async function ifUserHasPendingInvite(email, userId) {
    const client = (await dbMongoAtlas.getDb('invitation')).client;
    const collection = (await dbMongoAtlas.getDb('invitation')).collection;
    let res = await collection.findOne({email: email},);
    let documentRef = null;
    let permission = null;

    if (res) {
        documentRef = new ObjectId(res.documentRef);
        permission = res.permission;

        await collection.deleteOne({_id: res._id});
    }

    await client.close();

    if (res) {
        const permissionClient = (await dbMongoAtlas.getDb('permission')).client;
        const permissionCollection = (await dbMongoAtlas.getDb('permission')).collection;
        let data = {
            'userRef': userId,
            'documentRef': documentRef,
            'permission': permission
        }

        res = await permissionCollection.insertOne(data);

        await permissionClient.close();
    }

    return res;
}


/**
 * Updates new document in collection
 *
 * @async
 *
 * @param filter
 * @param {array} data        Data to update the new document
 * @throws Error when database operation fails.
 * @return {Promise<array>} The resultset as an array.
 */
async function updateDocument(filter, data) {
    const client = (await dbMongoAtlas.getDb('document')).client;
    const collection = (await dbMongoAtlas.getDb('document')).collection;
    const res = await collection.updateOne(filter, data,);

    await client.close();

    return res;
}

async function getAllFiles(userId) {
    try {
        return await findAll(userId);
    } catch (err) {
        console.log(err);
    }
}

async function getSpecificFile(id) {
    try {
        return getSpecificDocument(id);
    } catch (err) {
        console.log(err);
    }
}

function createNewFile(fileData, userid) {
    try {
        return createNewDocument(fileData, userid);
    } catch (err) {
        console.log(err);
    }
}

async function updateFile(filter, newFileData,) {
    try {
        return await updateDocument(filter, newFileData);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {getAllFiles, createNewFile, updateFile, getSpecificFile, addUserToInviteList, ifUserHasPendingInvite}