# Firevolx Deployment Guide

## For HTML Direct Opening

The project is now configured to work when downloaded as a ZIP file and opened directly via `index.html`. The build configuration uses relative paths and all necessary assets are bundled correctly.

### To build for static deployment:
```bash
npm run build
```

The `dist` folder will contain all files needed for deployment.

## Raspberry Pi Telnet Connection Setup

### 1. Server Setup
The telnet proxy server is located in `src/services/telnetProxy.js`. To run it:

```bash
cd src/services
npm install
npm start
```

The server will run on port 8081 by default.

### 2. Raspberry Pi Configuration

Ensure your Raspberry Pi has:
- SSH enabled: `sudo systemctl enable ssh`
- Network access from your web application
- ROS 2 Humble installed
- Firevolx detection packages installed

### 3. Connection Process

1. In the Settings page, configure your robots with correct IP addresses
2. Use the Terminal Access feature to connect
3. The system will establish a real telnet/SSH connection through the proxy server

### 4. Fire Detection Integration

The system listens for ROS 2 messages from the fire detection system. Configure your Raspberry Pi to publish fire alerts to the `/fire_alert` topic:

```bash
# Example ROS 2 command to test fire alert
ros2 topic pub /fire_alert std_msgs/String "data: 'Fire detected in Production Line A - HIGH severity'"
```

### 5. Production Deployment

For production use:
1. Deploy the telnet proxy server on a secure server
2. Configure firewall rules for port 8081
3. Update the telnet service to use your proxy server's address
4. Set up SSL/TLS for secure connections

### 6. Testing Connection

Use the health check endpoint to verify the proxy server:
```
GET http://your-server:8081/health
```

Test Raspberry Pi connectivity:
```
POST http://your-server:8081/test-connection
{
  "host": "192.168.1.100",
  "port": 22,
  "username": "firevolx",
  "password": "your-password"
}
```

## Security Notes

- Change default passwords on all Raspberry Pi devices
- Use SSH key authentication instead of passwords when possible
- Implement network segmentation for robot communication
- Monitor connection logs for suspicious activity