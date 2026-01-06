const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

let io = null;

/**
 * Initialize Socket.io server with authentication
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware - verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify user exists and is active
      const [users] = await pool.execute(
        `SELECT u.id, u.username, u.first_name, u.last_name, u.position_id
         FROM user u
         WHERE u.id = ? AND u.is_active = TRUE`,
        [decoded.id]
      );

      if (!users.length) {
        return next(new Error('User not found or inactive'));
      }

      // Attach user info to socket
      socket.userId = decoded.id;
      socket.user = {
        id: users[0].id,
        username: users[0].username,
        name: `${users[0].first_name} ${users[0].last_name}`,
        positionId: users[0].position_id
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`[Socket.io] User ${socket.user.name} (ID: ${socket.userId}) connected`);

    // Join user-specific room for targeted updates
    socket.join(`user:${socket.userId}`);

    // Handle joining project-specific rooms
    socket.on('join:project', (joNumber) => {
      if (joNumber) {
        socket.join(`project:${joNumber}`);
        console.log(`[Socket.io] User ${socket.userId} joined project room: ${joNumber}`);
      }
    });

    // Handle leaving project-specific rooms
    socket.on('leave:project', (joNumber) => {
      if (joNumber) {
        socket.leave(`project:${joNumber}`);
        console.log(`[Socket.io] User ${socket.userId} left project room: ${joNumber}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] User ${socket.userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket.io] Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log('[Socket.io] Server initialized');
  return io;
};

/**
 * Get the Socket.io server instance
 * @returns {Server|null} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] Server not initialized');
    return null;
  }
  return io;
};

/**
 * Emit real-time event to all connected clients
 * @param {Object} event - Event payload
 */
const emitRealtimeEvent = (event) => {
  if (io) {
    io.emit('realtime:update', event);
    console.log(`[Socket.io] Broadcast event:`, event.type, event.entity);
  }
};

/**
 * Emit event to a specific project room
 * @param {string} joNumber - Project JO number
 * @param {Object} event - Event payload
 */
const emitToProject = (joNumber, event) => {
  if (io && joNumber) {
    io.to(`project:${joNumber}`).emit('realtime:update', event);
    console.log(`[Socket.io] Project room (${joNumber}) event:`, event.type, event.entity);
  }
};

/**
 * Emit event to a specific user
 * @param {number} userId - User ID
 * @param {Object} event - Event payload
 */
const emitToUser = (userId, event) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('realtime:update', event);
    console.log(`[Socket.io] User (${userId}) event:`, event.type, event.entity);
  }
};

/**
 * Get count of connected clients
 * @returns {number} Number of connected clients
 */
const getConnectedCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

module.exports = {
  initializeSocket,
  getIO,
  emitRealtimeEvent,
  emitToProject,
  emitToUser,
  getConnectedCount,
};
