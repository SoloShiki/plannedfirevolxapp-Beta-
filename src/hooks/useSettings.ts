import { useState, useEffect } from 'react';

export interface Robot {
  id: string;
  name: string;
  location: string;
  wifiNetwork: string;
  wifiPassword: string;
  status: 'online' | 'offline' | 'alert';
  ipAddress?: string;
}

export interface CameraStream {
  id: string;
  name: string;
  streamUrl: string;
  associatedRobot: string;
  status: 'active' | 'alert' | 'offline';
  location: string;
}

export interface Settings {
  robots: Robot[];
  cameraStreams: CameraStream[];
  emergencyContacts: {
    primaryContact: string;
    secondaryContact: string;
    emailContact: string;
  };
  alertSettings: {
    pushNotifications: boolean;
    emailAlerts: boolean;
    smsAlerts: boolean;
    alertSound: string;
  };
  account: {
    companyName: string;
    facilityId: string;
  };
}

const defaultSettings: Settings = {
  robots: [
    {
      id: "RBT-001",
      name: "Patrol Robot Alpha",
      location: "Production Line A",
      wifiNetwork: "Factory-WiFi",
      wifiPassword: "",
      status: "online",
      ipAddress: "192.168.1.100"
    },
    {
      id: "RBT-002",
      name: "Patrol Robot Beta",
      location: "Manufacturing Floor",
      wifiNetwork: "Factory-WiFi",
      wifiPassword: "",
      status: "online",
      ipAddress: "192.168.1.101"
    },
    {
      id: "RBT-003",
      name: "Patrol Robot Gamma",
      location: "Storage Area B",
      wifiNetwork: "Factory-WiFi",
      wifiPassword: "",
      status: "online",
      ipAddress: "192.168.1.102"
    }
  ],
  cameraStreams: [
    {
      id: "CAM-001",
      name: "Main Entrance Camera",
      streamUrl: "https://demo.ip-cam.com/demo1",
      associatedRobot: "RBT-001",
      status: "active",
      location: "Production Line A"
    },
    {
      id: "CAM-002",
      name: "Factory Floor Camera",
      streamUrl: "https://demo.ip-cam.com/demo2",
      associatedRobot: "RBT-002",
      status: "active",
      location: "Manufacturing Floor"
    },
    {
      id: "CAM-003",
      name: "Emergency Exit Camera",
      streamUrl: "https://demo.ip-cam.com/demo3",
      associatedRobot: "RBT-003",
      status: "active",
      location: "Storage Area B"
    }
  ],
  emergencyContacts: {
    primaryContact: "",
    secondaryContact: "",
    emailContact: ""
  },
  alertSettings: {
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    alertSound: "siren"
  },
  account: {
    companyName: "",
    facilityId: ""
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('firevolxSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Validate and merge with defaults
          const mergedSettings = {
            ...defaultSettings,
            ...parsed,
            // Ensure arrays exist
            robots: Array.isArray(parsed.robots) ? parsed.robots : defaultSettings.robots,
            cameraStreams: Array.isArray(parsed.cameraStreams) ? parsed.cameraStreams : defaultSettings.cameraStreams
          };
          setSettings(mergedSettings);
          console.log('✅ Settings loaded successfully');
        }
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        // Fallback to default settings
        setSettings(defaultSettings);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Persist to localStorage with error handling
      localStorage.setItem('firevolxSettings', JSON.stringify(updatedSettings));
      console.log('💾 Settings saved successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      return false;
    }
  };

  const updateRobot = (robotId: string, updates: Partial<Robot>) => {
    const updatedRobots = settings.robots.map(robot =>
      robot.id === robotId ? { ...robot, ...updates } : robot
    );
    saveSettings({ robots: updatedRobots });
  };

  const updateCameraStream = (streamId: string, updates: Partial<CameraStream>) => {
    const updatedStreams = settings.cameraStreams.map(stream =>
      stream.id === streamId ? { ...stream, ...updates } : stream
    );
    saveSettings({ cameraStreams: updatedStreams });
  };

  return {
    settings,
    saveSettings,
    updateRobot,
    updateCameraStream
  };
};