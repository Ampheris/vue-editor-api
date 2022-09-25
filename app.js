const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();
const httpServer = require("http").createServer(app);
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


const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', function(socket) {
    socket.on('hello', (...args) => {
        console.log('Connected from client ' + args);
    });

    socket.on('create', function(room) {
        socket.join(room);
        console.log(`A room has been joined with id: ${room}`);
    });

    socket.on('liveUpdate', (data) => {
        console.log('Data has been recieved,');
        socket.to(data['_id']).emit("doc", data);
        console.log(`data transmitted: ${data}`);
    })
});

const server = httpServer.listen(port, () => {
    console.log('auth api listening on port ' + port);
});

module.exports = server;