import { Server as SocketIOServer } from 'socket.io';

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('start-analysis', (data) => {
      console.log('Analysis started:', data);
      
      // Simulate real-time analysis
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          socket.emit('analysis-complete', {
            riskScore: Math.random() * 100,
            threatType: 'SIMULATED',
            confidence: 0.85,
          });
          clearInterval(interval);
        } else {
          socket.emit('analysis-progress', { progress: Math.min(progress, 100) });
        }
      }, 500);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
