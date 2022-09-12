const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();

const api = require("./routes/index");

const port = process.env.PORT || 1337;

app.use(cors());
app.options('*', cors());

app.disable('x-powered-by');

app.set("view engine", "ejs");

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", api);

const server = app.listen(port, () => {
    console.log('auth api listening on port ' + port);
});

module.exports = server;