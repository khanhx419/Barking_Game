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

// Cleanup finished/empty rooms periodically
setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.isEmpty() || room.phase === 'finished') {
      room.stopLoop();
      rooms.delete(roomId);
      console.log(`Cleaned up room: ${roomId}`);
    }
  }
}, 10000);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('room:create', ({ playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(roomId);
    
    const room = new GameRoom(roomId, io);
    rooms.set(roomId, room);
    
    room.addPlayer(socket.id, playerName);
    socket.emit('room:created', { roomId });
    console.log(`Room created: ${roomId} by ${playerName}`);
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
    console.log(`Player ${playerName} joined room ${roomId}`);
    
    // Auto-start when 2 players join
    if (room.isFull()) {
      room.startCountdown();
    }
  });

  socket.on('audio:power', (data) => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (room) {
      room.handlePowerUpdate(socket.id, data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Find rooms this socket was in and remove them
    for (const [roomId, room] of rooms.entries()) {
      if (room.hasPlayer(socket.id)) {
        room.removePlayer(socket.id);
        io.to(roomId).emit('player:disconnect', { message: 'Opponent left the game' });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Barking Battle Server running on port ${PORT}`);
});
