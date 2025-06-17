import { Server } from 'socket.io';

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.setupEvents();
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('place_bid', (data) => this.io.emit('bid_update', data));
      socket.on('vote', (data) => this.io.emit('voteUpdate', data));

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  get ioInstance() {
    return this.io;
  }
}

export default SocketHandler;
