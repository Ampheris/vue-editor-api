// Server
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', function(socket) {
    console.log(socket.id); // Nått lång och slumpat
    socket.on('chat message', function (message) {
        io.emit('chat message', message);
    });
});