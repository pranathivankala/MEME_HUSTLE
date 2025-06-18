import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_API_URL || '/', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('bid_update', (data) => {
      const listeners = this.listeners.get('bid_update') || [];
      listeners.forEach(callback => callback(data));
    });

    this.socket.on('bid_error', (error) => {
      const listeners = this.listeners.get('bid_error') || [];
      listeners.forEach(callback => callback(error));
    });

    this.socket.on('bid_accepted', (data) => {
      const listeners = this.listeners.get('bid_accepted') || [];
      listeners.forEach(callback => callback(data));
    });

    this.socket.on('voteUpdate', (data) => {
      const listeners = this.listeners.get('vote_update') || [];
      listeners.forEach(callback => callback(data));
    });

    this.socket.on('voteError', (error) => {
      console.error('Vote error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToBids(memeId, callback) {
    if (!this.socket) this.connect();

    const wrappedCallback = (data) => {
      if (!memeId || data.memeId === memeId) {
        callback(data);
      }
    };

    const listeners = this.listeners.get('bid_update') || [];
    this.listeners.set('bid_update', [...listeners, wrappedCallback]);

    return () => {
      const updated = this.listeners.get('bid_update').filter(cb => cb !== wrappedCallback);
      this.listeners.set('bid_update', updated);
    };
  }

  subscribeToBidErrors(callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('bid_error') || [];
    this.listeners.set('bid_error', [...listeners, callback]);

    return () => {
      const updated = this.listeners.get('bid_error').filter(cb => cb !== callback);
      this.listeners.set('bid_error', updated);
    };
  }

  subscribeToBidAccepted(callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('bid_accepted') || [];
    this.listeners.set('bid_accepted', [...listeners, callback]);

    return () => {
      const updated = this.listeners.get('bid_accepted').filter(cb => cb !== callback);
      this.listeners.set('bid_accepted', updated);
    };
  }

  subscribeToVotes(memeId, callback) {
    if (!this.socket) this.connect();

    const wrappedCallback = (data) => {
      if (!memeId || data.memeId === memeId) {
        callback(data);
      }
    };

    const listeners = this.listeners.get('vote_update') || [];
    this.listeners.set('vote_update', [...listeners, wrappedCallback]);

    return () => {
      const updated = this.listeners.get('vote_update').filter(cb => cb !== wrappedCallback);
      this.listeners.set('vote_update', updated);
    };
  }

  subscribeToNewMemes(callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('new_meme') || [];
    this.listeners.set('new_meme', [...listeners, callback]);

    this.socket.on('new_meme', (data) => {
      const listeners = this.listeners.get('new_meme') || [];
      listeners.forEach(cb => cb(data));
    });

    return () => {
      const updated = this.listeners.get('new_meme').filter(cb => cb !== callback);
      this.listeners.set('new_meme', updated);
    };
  }

  unsubscribeAll() {
    this.listeners.clear();
  }

  placeBid(bidData) {
    if (!this.socket) this.connect();
    this.socket.emit('place_bid', bidData);
  }

  castVote(memeId, userId, voteType) {
    if (!this.socket) this.connect();
    this.socket.emit('vote', { memeId, userId, voteType });
  }
}

const socketService = new SocketService();

export default socketService;
