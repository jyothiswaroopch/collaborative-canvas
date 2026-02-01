class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                history: [],
                redoStack: [],
                users: new Map()
            });
            console.log(`Room ${roomId} created`);
        }
    }

    joinRoom(roomId, socketId, user) {
        this.createRoom(roomId);
        const room = this.rooms.get(roomId);
        room.users.set(socketId, user);
        return room;
    }

    leaveRoom(roomId, socketId) {
        if (this.rooms.has(roomId)) {
            const room = this.rooms.get(roomId);
            room.users.delete(socketId);
            if (room.users.size === 0) {
            }
        }
    }

    addStroke(roomId, stroke) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.history.push(stroke);
            room.redoStack = [];
            return true;
        }
        return false;
    }

    undo(roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.history.length > 0) {
            const stroke = room.history.pop();
            room.redoStack.push(stroke);
            return room.history;
        }
        return null;
    }

    redo(roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.redoStack.length > 0) {
            const stroke = room.redoStack.pop();
            room.history.push(stroke);
            return room.history;
        }
        return null;
    }

    getHistory(roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.history : [];
    }

    getUsers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room.users.values()) : [];
    }
}

module.exports = new RoomManager();
