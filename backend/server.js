import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import transactionRoutes from './routes/transactions.js';
import botRoutes from './routes/bots.js';
import { verifyToken, isAdmin } from './middleware/auth.js';

dotenv.config();

// MongoDB bağlantısı
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:5173'
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bots', botRoutes);

// WebSocket bağlantıları
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('subscribe_market', (symbol) => {
    socket.join(`market:${symbol}`);
  });

  socket.on('unsubscribe_market', (symbol) => {
    socket.leave(`market:${symbol}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Market verilerini simüle et
setInterval(() => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
  symbols.forEach(symbol => {
    const price = Math.random() * 1000;
    io.to(`market:${symbol}`).emit('market_update', {
      symbol,
      price,
      time: Date.now()
    });
  });
}, 1000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});