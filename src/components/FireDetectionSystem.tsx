import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { ros2Service } from "@/services/ros2Service";

interface FireDetectionEvent {
  robotId: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  timestamp: Date;
  temperature?: number;
  smokeLevel?: number;
  verified: boolean;
}

interface FireDetectionSystemProps {
  onFireDetected: (event: FireDetectionEvent) => void;
}

export const FireDetectionSystem = ({ onFireDetected }: FireDetectionSystemProps) => {
  const { settings } = useSettings();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, attempts: 0 });
  
  // Subscribe to real fire detection events from ROS2 service
  useEffect(() => {
    if (!isMonitoring) return;

    console.log('🔥 Fire Detection System: Starting monitoring...');

    // Subscribe to fire detection events from ROS2 WebSocket
    const unsubscribeFireDetection = ros2Service.subscribeToFireDetection((detection) => {
      console.log('🔥 Fire detection received:', detection);
      
      // Only process verified fire detections
      if (detection.type === 'fire_detected' && detection.verified === true) {
        const robot = settings.robots.find(r => r.id === detection.robotId);
        
        if (robot && robot.status === 'online') {
          const fireEvent: FireDetectionEvent = {
            robotId: detection.robotId,
            location: robot.location,
            severity: detection.severity || 'medium',
            confidence: detection.confidence || 0.85,
            timestamp: new Date(detection.timestamp || Date.now()),
            temperature: detection.temperature,
            smokeLevel: detection.smokeLevel,
            verified: true
          };
          
          console.log('🔥 Verified fire event processed:', fireEvent);
          onFireDetected(fireEvent);
        } else {
          console.warn('🔥 Fire detection ignored: Robot not found or offline');
        }
      } else {
        console.log('🔥 Fire detection ignored: Not verified or wrong type');
      }
    });

    // Subscribe to emergency alerts that might include fire events
    const unsubscribeEmergency = ros2Service.subscribeToEmergencyAlerts((alert) => {
      if (alert.type === 'fire_detected') {
        const robot = settings.robots.find(r => r.id === alert.robotId);
        
        if (robot && robot.status === 'online') {
          const fireEvent: FireDetectionEvent = {
            robotId: alert.robotId,
            location: alert.location || robot.location,
            severity: alert.severity,
            confidence: 0.95, // Emergency alerts have high confidence
            timestamp: new Date(alert.timestamp),
            verified: true
          };
          
          console.log('🚨 Emergency fire alert processed:', fireEvent);
          onFireDetected(fireEvent);
        }
      }
    });

    // Monitor connection status
    const unsubscribeStatus = ros2Service.subscribeToConnectionStatus((status) => {
      setConnectionStatus(status);
      console.log('🔗 ROS2 Connection Status:', status);
    });

    return () => {
      unsubscribeFireDetection();
      unsubscribeEmergency();
      unsubscribeStatus();
    };
  }, [isMonitoring, settings.robots, onFireDetected]);

  // Monitor system health and robot status
  useEffect(() => {
    if (!isMonitoring || !connectionStatus.connected) return;

    const healthCheckInterval = setInterval(async () => {
      const onlineRobots = settings.robots.filter(robot => robot.status === 'online');
      
      for (const robot of onlineRobots) {
        try {
          const status = await ros2Service.getRobotStatus(robot.id);
          
          // Check for fire indicators in sensor data
          if (status.sensors) {
            const { temperature, smoke } = status.sensors;
            
            // Real fire detection logic based on sensor thresholds
            if (temperature > 60 || smoke === true) {
              const fireEvent: FireDetectionEvent = {
                robotId: robot.id,
                location: robot.location,
                severity: temperature > 80 ? 'critical' : temperature > 70 ? 'high' : 'medium',
                confidence: 0.90,
                timestamp: new Date(),
                temperature,
                smokeLevel: smoke ? 100 : 0,
                verified: true
              };
              
              console.log('🔥 Fire detected via sensor data:', fireEvent);
              onFireDetected(fireEvent);
            }
          }
        } catch (error) {
          console.error(`Failed to get status for robot ${robot.id}:`, error);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheckInterval);
  }, [isMonitoring, connectionStatus.connected, settings.robots, onFireDetected]);

  // This component doesn't render anything - it's a background service
  return null;
};

// Export utility functions for external use
export type { FireDetectionEvent };