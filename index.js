const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const Game = require("./Game");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));

// Functions
const updateUser = (room) => {
    let players = [];
    room.forEach((p, i) => {
        players[i] = p.name;
    });
    room.forEach((p) => {
        p.emit("updateUser", players);
    });
};

let rooms = {};

io.on("connection", (socket) => {
    socket.on("name", (name) => {
        socket.name = name;
        socket.roomName = "";

        socket.on("joinRoom", (roomName) => {
            if (!rooms[roomName]) {
                socket.roomName = roomName;
                rooms[roomName] = [socket];
                socket.emit("joinedRoom", "owner");
                updateUser(rooms[roomName]);
            } else {
                if (rooms[roomName].length < 50) {
                    socket.roomName = roomName;
                    rooms[roomName].push(socket);
                    socket.emit("joinedRoom");
                    updateUser(rooms[roomName]);
                } else {
                    socket.emit("joinError", "Room tersebut sudah full");
                }
            }
        });

        socket.on("start", () => {
            if (rooms[socket.roomName]) {
                let room = rooms[socket.roomName];
                if (room.indexOf(socket) === 0) {
                    if (room.length >= 2 && room.length < 50) {
                        room.forEach((p, i) => {
                            p.emit("start");
                        });
                        new Game(room);
                        delete rooms[socket.roomName];
                    } else {
                        socket.emit("startError", "Pemain tidak cukup");
                    }
                }
            }
        });

        socket.on("disconnect", () => {
            if (rooms[socket.roomName]) {
                rooms[socket.roomName];
                if (rooms[socket.roomName].includes(socket)) {
                    rooms[socket.roomName].splice(
                        rooms[socket.roomName].indexOf(socket),
                        1
                    );
                    if (rooms[socket.roomName].length === 0) {
                        return delete rooms[socket.roomName];
                    }
                    updateUser(rooms[socket.roomName]);
                }
            }
        });
    });
});

server.listen(8080);
