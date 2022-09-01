var express = require('express');
var router = express.Router();
var search = require('../src/search.service')

router.post('/create', function (req, res, next) {
    try {
        let newData = req.params.data;
        search.createNewFile(newData);
    }catch (err) {
        res.status(400).json(err);
    }

    const data = {
        data: {
            msg: "Trying to create new file"
        }
    };

    res.status(200).json(data);
});

router.post('/update/:id', function (req, res, next) {
    try {
        const fileId = req.params.id;
        const updatedData = req.body.data;
        search.updateFile(updatedData, fileId);
    }catch (err) {
        res.json(err);
    }

    const data = {
        data: {
            msg: "Trying to update file"
        }
    };

    res.status(200).json(data);
});

router.get('/getAllFiles',  function (req, res, next) {
    const files = search.getAllFiles();
    const data = {
        data: {
            files: files
        }
    };


    res.status(200).json(data);
});

module.exports = router;