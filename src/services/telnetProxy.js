// Telnet WebSocket Proxy Server
// This server should be deployed alongside your app for real Raspberry Pi connections

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Telnet } = require('telnet-client');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;

// Store active telnet connections
const connections = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('connect-telnet', async (config) => {
    const { host, port, username, password } = config;
    
    try {
      const connection = new Telnet();
      const params = {
        host: host,
        port: port || 22,
        shellPrompt: /[$#>]\s*$/,
        timeout: 10000,
        username: username,
        password: password || '',
        // SSH connection options
        sock: null,
        irs: '\r\n',
        ors: '\n',
        echoLines: 1
      };

      await connection.connect(params);
      connections.set(socket.id, connection);
      
      socket.emit('connected', { success: true });
      
      // Handle data from telnet connection
      connection.on('data', (data) => {
        socket.emit('data', data.toString());
      });

      connection.on('error', (error) => {
        socket.emit('error', error.message);
        connections.delete(socket.id);
      });

      connection.on('close', () => {
        socket.emit('disconnected');
        connections.delete(socket.id);
      });

    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('command', async (command) => {
    const connection = connections.get(socket.id);
    if (connection) {
      try {
        const result = await connection.exec(command);
        socket.emit('data', result);
      } catch (error) {
        socket.emit('error', error.message);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const connection = connections.get(socket.id);
    if (connection) {
      connection.end();
      connections.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: connections.size });
});

// Test raspberry pi connectivity
app.post('/test-connection', async (req, res) => {
  const { host, port, username, password } = req.body;
  
  try {
    const connection = new Telnet();
    await connection.connect({
      host,
      port: port || 22,
      username,
      password: password || '',
      timeout: 5000
    });
    
    // Test basic command
    const result = await connection.exec('whoami');
    await connection.end();
    
    res.json({ 
      success: true, 
      message: 'Connection successful',
      result: result.trim()
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

server.listen(PORT, () => {
  console.log(`Telnet proxy server running on port ${PORT}`);
  console.log('Ready to accept Raspberry Pi connections');
});

module.exports = { app, server };