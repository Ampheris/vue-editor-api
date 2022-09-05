var express = require('express');
var router = express.Router();
var search = require('../src/search.service')


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
        let newData = req.params.data;
        await search.createNewFile(newData);
    } catch (err) {
        res.status(400).json(err);
    }

    const data = {
        data: {
            msg: "Trying to create new file"
        }
    };

    res.status(200).json(data);
});

router.post('/update/:id', async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const updatedData = req.body.data;
        await search.updateFile(updatedData, fileId);
    } catch (err) {
        res.json(err);
    }

    const data = {
        data: {
            msg: "Trying to update file"
        }
    };

    res.status(200).json(data);
});

router.get('/all', async function (req, res, next) {
    const files = await search.getAllFiles();
    console.log(`Files: ${files}`);

    const data = {
        files: files
    };

    res.status(200).json(data);
});

module.exports = router;