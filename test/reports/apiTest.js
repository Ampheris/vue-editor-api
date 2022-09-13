/* global it describe */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');

chai.should();

const database = require("../../db/database.js");
const collectionName = "document";

chai.use(chaiHttp);

let idOfDocument = '';

describe('Testing the API routes', () => {
    beforeEach(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();
            let newDoc = {
                name: 'New amazing document',
                content: 'Amazing content'
            };

            db.db.listCollections(
                {name: collectionName}
            )
                .next()
                .then(async function (info) {
                    if (info) {
                        await db.collection.drop();
                    }

                })
                .catch(function (err) {
                    console.error(`error: ${err}`);
                })
                .finally(async function () {
                    let response = await db.collection.insertOne(newDoc);
                    await db.client.close();

                    idOfDocument = response.insertedId;
                    resolve();
                });
        });
    });

    describe('GET /api', () => {
        it('Getting /', (done) => {
            chai.request(server)
                .get("/api")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.include({msg: 'Hello! Welcome to the API.'});
                    done();
                });
        });

        it('should create new document', (done) => {
            let newDocument = {
                name: "Newly created document by test",
                content: "This is a new document by test."
            };

            chai.request(server)
                .post("/api/create")
                .send(newDocument)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.include(
                        {
                            _id: res.body._id,
                            name: "Newly created document by test",
                            content: "This is a new document by test."
                        }
                    );

                    done();
                });
        });

        it('should get all documents', (done) => {
            chai.request(server)
                .get("/api/all")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.files.length.should.be.above(0);

                    done();
                });
        });

        it('should get a specific document', (done) => {
            chai.request(server)
                .get(`/api/get/${idOfDocument}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.file.should.contain(idOfDocument);

                    done();
                });
        });

        it('should update the new document', (done) => {
            let updatedDocument = {
                content: 'This is an UPDATED text.'
            };

            chai.request(server)
                .put(`/api/update/${idOfDocument}`)
                .send(updatedDocument)
                .end((err, res) => {
                    res.body.should.include({
                        "acknowledged": true,
                        "modifiedCount": 1,
                        "upsertedId": null,
                        "upsertedCount": 0,
                        "matchedCount": 1
                    });

                    done();
                });
        });
    });

});