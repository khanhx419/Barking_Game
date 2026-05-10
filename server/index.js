const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameRoom = require('./game/GameRoom');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Store active rooms
const rooms = new Map(); // roomId -> GameRoom

// FIX #4: Explicitly track which room each socket belongs to.
// Relying on socket.rooms.find() is fragile — if a socket was ever
// in multiple rooms (e.g. after reconnect), find() returns the wrong one.
const socketRoomMap = new Map(); // socketId -> roomId

// Helper: get list of joinable public rooms
function getPublicRooms() {
  const list = [];
  for (const [roomId, room] of rooms.entries()) {
    if (room.phase === 'waiting' && !room.isFull()) {
      list.push({
        roomId,
        hostName: room.players[0]?.name || 'Unknown',
        playerCount: room.players.length,
      });
    }
  }
  return list;
}

// Broadcast updated room list to all connected clients
function broadcastRoomList() {
  io.emit('rooms:updated', getPublicRooms());
}

// Cleanup finished/empty rooms periodically
setInterval(() => {
  let changed = false;
  for (const [roomId, room] of rooms.entries()) {
    if (room.isEmpty() || room.phase === 'finished') {
      room.stopLoop();
      rooms.delete(roomId);
      console.log(`Cleaned up room: ${roomId}`);
      changed = true;
    }
  }
  if (changed) broadcastRoomList();
}, 10000);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current room list on connect
  socket.emit('rooms:updated', getPublicRooms());

  // Client can request a refresh
  socket.on('rooms:list', () => {
    socket.emit('rooms:updated', getPublicRooms());
  });

  socket.on('room:create', ({ playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(roomId);
    
    const room = new GameRoom(roomId, io);
    rooms.set(roomId, room);
    
    room.addPlayer(socket.id, playerName);
    socketRoomMap.set(socket.id, roomId); // Track explicitly
    socket.emit('room:created', { roomId });
    console.log(`Room created: ${roomId} by ${playerName}`);

    broadcastRoomList();
  });

  socket.on('room:join', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      return socket.emit('error', { message: 'Room not found' });
    }
    
    if (room.isFull()) {
      return socket.emit('error', { message: 'Room is full' });
    }

    socket.join(roomId);
    room.addPlayer(socket.id, playerName);
    socketRoomMap.set(socket.id, roomId); // Track explicitly
    console.log(`Player ${playerName} joined room ${roomId}`);
    
    broadcastRoomList();

    // Auto-start when 2 players join
    if (room.isFull()) {
      room.startCountdown();
    }
  });

  socket.on('audio:power', (data) => {
    // FIX #4: use explicit map — no ambiguity from socket.rooms
    const roomId = socketRoomMap.get(socket.id);
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (room) {
      room.handlePowerUpdate(socket.id, data);
    }
  });

  // Player voluntarily leaves / forfeits
  socket.on('player:leave', () => {
    const roomId = socketRoomMap.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room && room.hasPlayer(socket.id)) {
      room.stopLoop();
      room.removePlayer(socket.id);
      socket.leave(roomId);
      socketRoomMap.delete(socket.id);

      // If opponent still in room, they win by forfeit
      if (room.players.length > 0) {
        io.to(roomId).emit('game:end', {
          winner: room.players[0].name,
          reason: 'Opponent forfeited',
        });
        room.phase = 'finished';
      }
    }
    broadcastRoomList();
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const roomId = socketRoomMap.get(socket.id);
    socketRoomMap.delete(socket.id);

    if (roomId) {
      const room = rooms.get(roomId);
      if (room && room.hasPlayer(socket.id)) {
        room.removePlayer(socket.id);
        io.to(roomId).emit('player:disconnect', { message: 'Opponent left the game' });
      }
    }
    broadcastRoomList();
  });
});

server.listen(PORT, () => {
  console.log(`Barking Battle Server running on port ${PORT}`);
});
