import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Room state
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, username }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: [],
          status: 'waiting',
          questions: [],
          currentQuestionIndex: 0
        });
      }

      const room = rooms.get(roomId);
      const player = { id: socket.id, username, score: 0, ready: false };
      room.players.push(player);

      io.to(roomId).emit('room_update', room);
    });

    socket.on('player_ready', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) player.ready = true;

      const allReady = room.players.every(p => p.ready);
      if (allReady && room.players.length >= 2) {
        room.status = 'starting';
        io.to(roomId).emit('game_starting');
      }

      io.to(roomId).emit('room_update', room);
    });

    socket.on('start_game', ({ roomId, questions }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.status = 'playing';
      room.questions = questions;
      io.to(roomId).emit('game_started', { questions });
    });

    socket.on('submit_answer', ({ roomId, isCorrect }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player && isCorrect) {
        player.score += 1;
      }

      io.to(roomId).emit('room_update', room);
    });

    socket.on('next_question', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.currentQuestionIndex += 1;
      if (room.currentQuestionIndex >= room.questions.length) {
        room.status = 'finished';
      }
      io.to(roomId).emit('room_update', room);
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit('room_update', room);
          }
        }
      });
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
