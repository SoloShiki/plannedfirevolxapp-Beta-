# FirevolX - Industrial Safety Monitoring System

## Overview

FirevolX is a comprehensive industrial safety monitoring system that provides real-time fire detection and safety alerts using AI-powered analysis. The system integrates with Raspberry Pi devices equipped with ROS 2 for autonomous robot patrolling and monitoring of industrial facilities. It features live camera streaming, terminal access to remote devices, emergency alert systems, and configurable detection packages for various safety scenarios including fire detection and unsafe behavior monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent design
- **Styling**: Tailwind CSS with a custom industrial red/black theme optimized for safety monitoring
- **Routing**: React Router with HashRouter for static deployment compatibility
- **State Management**: React Query for server state and custom hooks for local state management
- **Mobile Support**: Capacitor for potential mobile app deployment

### Backend Architecture
- **Proxy Server**: Node.js WebSocket-to-Telnet proxy server for Raspberry Pi SSH/Telnet connections
- **Real-time Communication**: WebSocket connections for live data streaming and robot communication
- **ROS 2 Integration**: WebSocket bridge for communicating with ROS 2 Humble on Raspberry Pi devices
- **Data Storage**: Local storage for configuration settings with no external database dependencies

### Camera Streaming System
- **Multi-source Support**: Handles various video stream formats including YouTube, Vimeo, Twitch, and direct camera feeds
- **HLS Support**: Uses HLS.js for HTTP Live Streaming compatibility
- **Embedded Players**: Automatic URL conversion to embeddable formats for different platforms
- **Real-time Status**: Live monitoring of camera feed status with automatic error handling

### Emergency Alert System
- **Multi-channel Alerts**: Push notifications, email alerts, and SMS capabilities
- **Real-time Detection**: Integration with AI detection packages for fire and unsafe condition monitoring
- **Escalation Process**: Configurable emergency contacts with primary and secondary notification paths
- **Audio/Visual Alerts**: Browser-based alert sounds and visual indicators

### Robot Management
- **Device Configuration**: Management of multiple Raspberry Pi robots with WiFi and network settings
- **Status Monitoring**: Real-time status tracking (online/offline/alert) for each robot
- **Terminal Access**: Secure SSH/Telnet connections through WebSocket proxy for remote robot management
- **Location Tracking**: Geographic assignment and monitoring of robot patrol areas

### Detection Package System
- **Modular AI Packages**: Installable detection modules for different safety scenarios
- **Fire Detection Pro**: Advanced thermal imaging and smoke detection with false alarm reduction
- **Unsafe Condition Prevention**: PPE compliance, smoking detection, and behavior monitoring
- **Extensible Architecture**: Support for custom detection packages and industry-specific modules

## External Dependencies

### Core Dependencies
- **@foxglove/ws-protocol**: ROS 2 WebSocket communication protocol
- **socket.io**: Real-time bidirectional communication for telnet proxy
- **hls.js**: HTTP Live Streaming support for video feeds
- **@tanstack/react-query**: Server state management and caching

### UI Framework
- **@radix-ui/**: Complete set of accessible UI primitives
- **lucide-react**: Icon library for consistent iconography
- **tailwindcss**: Utility-first CSS framework for styling

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced development experience
- **eslint**: Code linting and quality assurance

### Hardware Integration
- **ROS 2 Humble**: Robot Operating System for Raspberry Pi communication
- **Raspberry Pi**: Edge computing devices for autonomous monitoring
- **IP Cameras**: Network-connected surveillance cameras for live feeds

### Network Services
- **WebSocket Servers**: Real-time communication infrastructure
- **Telnet/SSH**: Secure remote access to monitoring devices
- **WiFi Networks**: Wireless connectivity for mobile robot units