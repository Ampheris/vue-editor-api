const express = require('express');
const router = express.Router();
var search = require('../src/search.service')
const ObjectId = require('mongodb').ObjectId;

router.get('/', function (req, res, next) {
    const data = {
        data: {
            msg: "Hello! Welcome to the API."
        }
    };

    res.status(200).json(data);
});


router.post('/create', async function (req, res, next) {
    try {
        let name = req.body.name;
        let content = req.body.content;
        let newData = {'name': name, 'content': content}

        let data = await search.createNewFile(newData);

        res.status(200).json({_id: data.insertId, ...newData});

    } catch (err) {
        res.status(400).json(err);
    }
});

router.put('/update/:id', async function (req, res, next) {
    try {
        const objId = new ObjectId(req.params.id);
        const filter = {'_id': objId};
        const data = {$set: {'content': req.body.content}};

        let response = await search.updateFile(filter, data);
        res.status(200).json(response);

    } catch (err) {
        res.json(err);
    }

});

router.get('/all', async function (req, res, next) {
    const files = await search.getAllFiles();

    const data = {
        files: files
    };

    res.status(200).json(data);
});

router.get('/get/:id', async function (req, res, next) {
    const objId = new ObjectId(req.params.id);
    const specificFile = await search.getSpecificFile(objId);

    const data = {
        file: specificFile
    };

    res.status(200).json(data);
});


router.post('/register', async function (req, res, next) {
    res.status(200);
});


router.get('/login', async function (req, res, next) {
    res.status(200);
});

module.exports = router;