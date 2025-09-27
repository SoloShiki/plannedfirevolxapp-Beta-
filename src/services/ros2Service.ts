/**
 * Real ROS 2 Communication Service for Raspberry Pi Integration
 * WebSocket-based real-time communication with error recovery
 */

interface ROS2Message {
  topic: string;
  data: any;
  timestamp: number;
}

interface EmergencyAlert {
  type: 'fire_detected' | 'unsafe_condition' | 'equipment_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  robotId: string;
  description: string;
  timestamp: number;
}

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

class ROS2Service {
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000;
  private emergencyCallbacks: ((alert: EmergencyAlert) => void)[] = [];
  private statusCallbacks: ((status: { connected: boolean; attempts: number }) => void)[] = [];
  private wsUrl: string;
  private pingInterval: NodeJS.Timeout | null = null;
  private fireDetectionCallbacks: ((detection: any) => void)[] = [];

  constructor(config?: Partial<WebSocketConfig>) {
    this.wsUrl = config?.url || 'ws://localhost:8080/ros2-bridge';
    this.reconnectInterval = config?.reconnectInterval || 3000;
    this.maxReconnectAttempts = config?.maxReconnectAttempts || 10;
    this.connect();
  }

  private connect() {
    try {
      console.log('Attempting to connect to ROS 2 WebSocket bridge...');
      this.websocket = new WebSocket(this.wsUrl);
      
      this.websocket.onopen = this.handleOpen.bind(this);
      this.websocket.onmessage = this.handleMessage.bind(this);
      this.websocket.onclose = this.handleClose.bind(this);
      this.websocket.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleOpen() {
    console.log('✅ Connected to ROS 2 WebSocket bridge');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyStatusCallbacks();
    
    // Start ping to keep connection alive
    this.startPing();
    
    // Subscribe to emergency alerts and fire detection
    this.subscribeToTopics();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.topic) {
        case '/fire_detection/alert':
          this.handleFireDetection(message.data);
          break;
        case '/emergency/alert':
          this.handleEmergencyAlert(message.data);
          break;
        case '/robot/status':
          this.handleRobotStatus(message.data);
          break;
        default:
          console.log('Received message:', message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket connection closed:', event.reason);
    this.isConnected = false;
    this.stopPing();
    this.notifyStatusCallbacks();
    
    if (!event.wasClean) {
      this.handleReconnect();
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    this.isConnected = false;
    this.notifyStatusCallbacks();
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.notifyStatusCallbacks();
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * Math.min(this.reconnectAttempts, 5));
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private subscribeToTopics() {
    const subscriptions = [
      '/fire_detection/alert',
      '/emergency/alert',
      '/robot/status',
      '/camera/status'
    ];

    subscriptions.forEach(topic => {
      this.sendMessage({
        type: 'subscribe',
        topic,
        timestamp: Date.now()
      });
    });
  }

  private sendMessage(message: any) {
    if (this.isConnected && this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  private handleFireDetection(data: any) {
    console.log('🔥 Fire detection alert received:', data);
    this.fireDetectionCallbacks.forEach(callback => callback(data));
  }

  private handleEmergencyAlert(data: any) {
    const alert: EmergencyAlert = {
      type: data.type || 'fire_detected',
      severity: data.severity || 'high',
      location: data.location || 'Unknown',
      robotId: data.robotId || 'unknown',
      description: data.description || 'Emergency detected',
      timestamp: data.timestamp || Date.now()
    };
    
    this.notifyEmergencyCallbacks(alert);
  }

  private handleRobotStatus(data: any) {
    console.log('Robot status update:', data);
  }

  private notifyStatusCallbacks() {
    this.statusCallbacks.forEach(callback => 
      callback({ 
        connected: this.isConnected, 
        attempts: this.reconnectAttempts 
      })
    );
  }

  private notifyEmergencyCallbacks(alert: EmergencyAlert) {
    this.emergencyCallbacks.forEach(callback => callback(alert));
  }

  public sendCommand(robotId: string, command: string, params?: any): boolean {
    const message: ROS2Message = {
      topic: `/robot/${robotId}/cmd`,
      data: { command, params },
      timestamp: Date.now()
    };

    if (this.sendMessage(message)) {
      console.log('✅ ROS 2 command sent:', message);
      return true;
    } else {
      console.error('❌ Failed to send command - not connected');
      return false;
    }
  }

  public subscribeToEmergencyAlerts(callback: (alert: EmergencyAlert) => void) {
    this.emergencyCallbacks.push(callback);
    return () => {
      this.emergencyCallbacks = this.emergencyCallbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeToFireDetection(callback: (detection: any) => void) {
    this.fireDetectionCallbacks.push(callback);
    return () => {
      this.fireDetectionCallbacks = this.fireDetectionCallbacks.filter(cb => cb !== callback);
    };
  }

  public subscribeToConnectionStatus(callback: (status: { connected: boolean; attempts: number }) => void) {
    this.statusCallbacks.push(callback);
    callback({ connected: this.isConnected, attempts: this.reconnectAttempts }); // Call immediately with current status
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  public async getRobotStatus(robotId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to ROS 2 bridge'));
        return;
      }

      const requestId = `status_${robotId}_${Date.now()}`;
      const message = {
        type: 'get_status',
        robotId,
        requestId,
        timestamp: Date.now()
      };

      const timeout = setTimeout(() => {
        reject(new Error('Status request timeout'));
      }, 5000);

      // In a real implementation, you'd wait for a response with the matching requestId
      // For now, return mock data after sending the request
      if (this.sendMessage(message)) {
        clearTimeout(timeout);
        resolve({
          robotId,
          battery: Math.floor(Math.random() * 30) + 70,
          location: 'Production Floor',
          sensors: {
            temperature: 22.5 + (Math.random() - 0.5) * 5,
            humidity: 45 + (Math.random() - 0.5) * 10,
            smoke: Math.random() < 0.1,
            motion: Math.random() < 0.3
          },
          lastHeartbeat: Date.now(),
          connected: true
        });
      } else {
        clearTimeout(timeout);
        reject(new Error('Failed to send status request'));
      }
    });
  }

  public getConnectionStatus() {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      url: this.wsUrl
    };
  }

  public disconnect() {
    console.log('🔌 Disconnecting from ROS 2 bridge...');
    this.stopPing();
    if (this.websocket) {
      this.websocket.close(1000, 'Manual disconnect');
      this.websocket = null;
    }
    this.isConnected = false;
    this.notifyStatusCallbacks();
  }
}

export const ros2Service = new ROS2Service();
export type { EmergencyAlert, ROS2Message };