var express = require('express');
var router = express.Router();
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
        console.log(`data: ${newData.name}`);

        res.status(200).json({_id: data.insertId, ...newData});

    } catch (err) {
        res.status(400).json(err);
    }
});

router.put('/update/:id', async function (req, res, next) {
    try {
        const objId = new ObjectId(req.params.id);
        const filter = { '_id': objId};
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

module.exports = router;