# Telnet Proxy Server Setup

This project includes a Telnet proxy server that enables WebSocket connections to Raspberry Pi devices over Telnet/SSH.

## Prerequisites

- Node.js (v16 or higher)
- Access to Raspberry Pi devices on your network
- Proper network configuration for Telnet/SSH access

## Installation

1. Navigate to the services directory:
```bash
cd src/services
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Raspberry Pi Setup

1. **Enable SSH on Raspberry Pi:**
```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

2. **Configure network access:**
   - Ensure Raspberry Pi is connected to your network
   - Note the IP address: `ip addr show`
   - Configure static IP if needed in `/etc/dhcpcd.conf`

3. **Create user for monitoring (recommended):**
```bash
sudo adduser firevolx
sudo usermod -aG sudo firevolx
```

### Server Configuration

Edit the `telnetProxy.js` file to configure your setup:

```javascript
const DEFAULT_CONFIG = {
  websocketPort: 8081,
  telnetPort: 22, // SSH port (or 23 for Telnet)
  timeout: 30000,
  maxConnections: 10
};
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `ws://localhost:8081` by default.

## Usage in Application

1. **Configure Robot IPs:** In the app settings, add your Raspberry Pi IP addresses manually
2. **Test Connection:** Use the terminal component to verify connectivity
3. **Monitor Status:** The app will show connection status in real-time

## Raspberry Pi Connection Examples

### SSH Connection (Recommended)
- **Host:** `192.168.1.100`
- **Port:** `22`
- **Username:** `firevolx`
- **Password:** `your_password`

### Telnet Connection (Legacy)
- **Host:** `192.168.1.100`
- **Port:** `23`
- **Username:** `pi`
- **Password:** `raspberry`

## Troubleshooting

### Connection Issues
1. Check firewall settings on Raspberry Pi
2. Verify SSH/Telnet service is running
3. Test connectivity: `ping [raspberry_pi_ip]`
4. Check credentials and permissions

### Server Issues
1. Ensure WebSocket port (8081) is available
2. Check Node.js version compatibility
3. Review server logs for error messages

### Network Configuration
```bash
# On Raspberry Pi - Check SSH status
sudo systemctl status ssh

# Enable SSH if disabled
sudo systemctl enable ssh
sudo systemctl start ssh

# Configure firewall (if needed)
sudo ufw allow ssh
```

## Security Considerations

1. **Use SSH instead of Telnet** for encrypted connections
2. **Change default passwords** on Raspberry Pi
3. **Limit network access** using firewall rules
4. **Use key-based authentication** for SSH when possible
5. **Monitor connection logs** for suspicious activity

## Production Deployment

For production environments:

1. **Use environment variables** for configuration
2. **Implement proper logging**
3. **Set up monitoring** for server health
4. **Use process managers** like PM2 for reliability
5. **Configure proper SSL/TLS** for WebSocket connections

```bash
# Using PM2 for production
npm install -g pm2
pm2 start telnetProxy.js --name "firevolx-telnet-proxy"
pm2 startup
pm2 save
```

## API Reference

The WebSocket proxy accepts these events:

- `connect-telnet`: Establish connection to Raspberry Pi
- `command`: Send command to connected device
- `disconnect`: Close connection

Events emitted:
- `connected`: Connection established successfully
- `data`: Response data from device
- `error`: Connection or command error
- `disconnect`: Connection closed