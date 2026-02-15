const { Poll } = require('../models/Poll');

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinPoll', (pollId) => {
      socket.join(pollId);
      console.log(`User ${socket.id} joined poll ${pollId}`);
    });

    socket.on('leavePoll', (pollId) => {
      socket.leave(pollId);
      console.log(`User ${socket.id} left poll ${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = handleSocketConnection;
