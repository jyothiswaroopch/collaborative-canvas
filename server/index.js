const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomManager = require('./roomManager');

const app = express();
app.use(cors());

const path = require('path');
if (process.env.NODE_ENV === 'production') {
    const clientDistPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ roomId, username, color }) => {
        socket.join(roomId);
        const user = { id: socket.id, username, color };
        roomManager.joinRoom(roomId, socket.id, user);

        const history = roomManager.getHistory(roomId);
        socket.emit('history_sync', history);

        const users = roomManager.getUsers(roomId);
        socket.emit('user_list', users);

        io.to(roomId).emit('user_list', roomManager.getUsers(roomId));
    });

    socket.on('draw_point', ({ roomId, point, toolOptions }) => {
        socket.to(roomId).emit('draw_point', {
            point,
            toolOptions,
            userId: socket.id
        });
    });

    socket.on('stroke_end', ({ roomId, stroke }) => {
        roomManager.addStroke(roomId, stroke);
        io.to(roomId).emit('stroke_committed', stroke);
    });

    socket.on('undo', ({ roomId }) => {
        const newHistory = roomManager.undo(roomId);
        if (newHistory) {
            io.to(roomId).emit('history_update', newHistory);
        }
    });

    socket.on('redo', ({ roomId }) => {
        const newHistory = roomManager.redo(roomId);
        if (newHistory) {
            io.to(roomId).emit('history_update', newHistory);
        }
    });

    socket.on('cursor_move', ({ roomId, x, y, color, username }) => {
        socket.to(roomId).emit('cursor_update', {
            userId: socket.id,
            x,
            y,
            color,
            username
        });
    });

    socket.on('disconnecting', () => {
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) {
                roomManager.leaveRoom(roomId, socket.id);
                io.to(roomId).emit('user_list', roomManager.getUsers(roomId));
                io.to(roomId).emit('user_left', { userId: socket.id });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
});
