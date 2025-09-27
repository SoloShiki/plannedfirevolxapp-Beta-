import { io, Socket } from 'socket.io-client';

export interface TelnetConnection {
  id: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface TelnetMessage {
  type: 'output' | 'input' | 'error' | 'status';
  data: string;
  timestamp: number;
}

class TelnetService {
  private connections: Map<string, TelnetConnection> = new Map();
  private sockets: Map<string, Socket> = new Map();
  private messageHandlers: Map<string, (message: TelnetMessage) => void> = new Map();
  private wsProxyUrl: string = `ws://${window.location.hostname}:8081`;

  // Configure WebSocket proxy URL (for production deployment)
  setWebSocketProxyUrl(url: string) {
    this.wsProxyUrl = url;
  }

  async connect(connection: Omit<TelnetConnection, 'id' | 'status'>): Promise<string> {
    const connectionId = `telnet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const telnetConnection: TelnetConnection = {
      ...connection,
      id: connectionId,
      status: 'connecting'
    };

    this.connections.set(connectionId, telnetConnection);

    try {
      // Connect to central Telnet proxy server (listening for Raspberry Pi devices)
      const wsUrl = this.wsProxyUrl;
      
      const socket = io(wsUrl, {
        transports: ['websocket'],
        timeout: 15000,
        reconnection: true,
        forceNew: true
      });

      socket.emit('connect-telnet', {
        host: connection.host,
        port: connection.port ?? 23,
        username: connection.username,
        password: connection.password
      });

      this.sockets.set(connectionId, socket);

      return new Promise((resolve, reject) => {
        socket.on('connect', () => {
          console.log(`WebSocket connected to Telnet proxy at ${wsUrl}`);
        });

        socket.on('connected', (data) => {
          if (data.success) {
            telnetConnection.status = 'connected';
            this.connections.set(connectionId, telnetConnection);
            this.notifyMessage(connectionId, {
              type: 'status',
              data: `Telnet connected to ${connection.username}@${connection.host}:${connection.port ?? 23}`,
              timestamp: Date.now()
            });
            resolve(connectionId);
          } else {
            throw new Error(data.error || 'Telnet connection failed');
          }
        });

        socket.on('data', (data: string) => {
          this.notifyMessage(connectionId, {
            type: 'output',
            data,
            timestamp: Date.now()
          });
        });

        socket.on('error', (error: any) => {
          telnetConnection.status = 'error';
          this.connections.set(connectionId, telnetConnection);
          this.notifyMessage(connectionId, {
            type: 'error',
            data: `Telnet error: ${error.message || error}`,
            timestamp: Date.now()
          });
          reject(new Error(error.message || 'Telnet connection failed'));
        });

        socket.on('disconnect', () => {
          telnetConnection.status = 'disconnected';
          this.connections.set(connectionId, telnetConnection);
          this.notifyMessage(connectionId, {
            type: 'status',
            data: 'Telnet connection closed',
            timestamp: Date.now()
          });
        });

        socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          telnetConnection.status = 'error';
          this.connections.set(connectionId, telnetConnection);
          this.notifyMessage(connectionId, {
            type: 'error',
            data: `Proxy connection error: ${error.message || error}`,
            timestamp: Date.now()
          });
          reject(error);
        });

        // Connection timeout
        setTimeout(() => {
          if (telnetConnection.status === 'connecting') {
            socket.disconnect();
            telnetConnection.status = 'error';
            this.connections.set(connectionId, telnetConnection);
            this.notifyMessage(connectionId, { type: 'error', data: 'Connection timeout', timestamp: Date.now() });
            reject(new Error('Connection timeout'));
          }
        }, 15000);
      });
    } catch (error) {
      telnetConnection.status = 'error';
      this.connections.set(connectionId, telnetConnection);
      throw error;
    }
  }

  /* Fallback simulation removed to enforce real Telnet connections */

  async sendCommand(connectionId: string, command: string): Promise<void> {
    const socket = this.sockets.get(connectionId);
    const connection = this.connections.get(connectionId);

    if (!connection || connection.status !== 'connected') {
      throw new Error('Connection not active');
    }

    this.notifyMessage(connectionId, {
      type: 'input',
      data: `${connection.username}@raspberrypi:~$ ${command}`,
      timestamp: Date.now()
    });

    if (socket && socket.connected) {
      // Send to Telnet proxy server
      socket.emit('command', command);
    } else {
      throw new Error('Proxy not connected');
    }
  }

  // Simulation removed

  disconnect(connectionId: string): void {
    const socket = this.sockets.get(connectionId);
    const connection = this.connections.get(connectionId);

    if (socket) {
      socket.disconnect();
      this.sockets.delete(connectionId);
    }

    if (connection) {
      connection.status = 'disconnected';
      this.connections.set(connectionId, connection);
    }
  }

  getConnection(connectionId: string): TelnetConnection | undefined {
    return this.connections.get(connectionId);
  }

  onMessage(connectionId: string, handler: (message: TelnetMessage) => void): void {
    this.messageHandlers.set(connectionId, handler);
  }

  removeMessageHandler(connectionId: string): void {
    this.messageHandlers.delete(connectionId);
  }

  private notifyMessage(connectionId: string, message: TelnetMessage): void {
    const handler = this.messageHandlers.get(connectionId);
    if (handler) {
      handler(message);
    }
  }

  // Direct TCP connection for production Raspberry Pi setups
  async connectDirect(host: string, port: number, username: string, password?: string): Promise<string> {
    console.log(`Attempting direct connection to ${username}@${host}:${port}`);
    return this.connect({ host, port, username, password });
  }

  // Get status of all connections
  getConnectionStatuses(): { [key: string]: string } {
    const statuses: { [key: string]: string } = {};
    this.connections.forEach((conn, id) => {
      statuses[id] = conn.status;
    });
    return statuses;
  }

  // Test connection to Raspberry Pi
  async testConnection(): Promise<boolean> {
    try {
      const wsUrl = this.wsProxyUrl;
      const socket = io(wsUrl, {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: false
      });

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          socket.disconnect();
          resolve(false);
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timer);
          socket.disconnect();
          resolve(true);
        });

        socket.on('connect_error', () => {
          clearTimeout(timer);
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }
}

export const telnetService = new TelnetService();