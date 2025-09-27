import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, AlertTriangle, Phone, ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import factoryFeed4 from "@/assets/factory-feed-4.jpg";
import { FireDetectionSystem } from "@/components/FireDetectionSystem";

const Emergency = () => {
  const [alertActive, setAlertActive] = useState(true);
  const [fireEvent, setFireEvent] = useState<any>(null);
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  // Get emergency location from actual fire detection or first robot as fallback
  const emergencyLocation = fireEvent?.location || 
    (settings.robots.length > 0 ? settings.robots[0].location : "Unknown Location");
  const emergencyRobot = fireEvent?.robotId || 
    (settings.robots.length > 0 ? settings.robots[0].id : "RBT-001");

  const handleFireDetected = (event: any) => {
    setFireEvent(event);
    setAlertActive(true);
  };

  // Simulate alert sound (in real app this would trigger actual sound)
  useEffect(() => {
    const interval = setInterval(() => {
      if (alertActive) {
        // Simulate alert flashing
        document.body.style.backgroundColor = 'hsl(0 100% 20%)';
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 200);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      document.body.style.backgroundColor = '';
    };
  }, [alertActive]);

  const handleCallEmergency = () => {
    // In real app, this would initiate emergency call
    const primaryContact = settings.emergencyContacts.primaryContact || "+1 (555) 911-0000";
    alert(`Calling emergency services: ${primaryContact}`);
  };

  const handleResolve = () => {
    setAlertActive(false);
    navigate("/");
  };

  return (
    <>
      <FireDetectionSystem onFireDetected={handleFireDetected} />
      <div className="min-h-screen bg-emergency/95 text-emergency-foreground p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-emergency-foreground hover:bg-emergency-foreground/10"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">FIREVOLX EMERGENCY</h1>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Main Alert */}
        <div className={`text-center mb-8 ${alertActive ? 'animate-pulse' : ''}`}>
          <div className="flex justify-center mb-4">
            <Flame size={80} className="text-emergency-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-2">FIRE DETECTED</h2>
          <h3 className="text-2xl font-semibold mb-4">EVACUATE IMMEDIATELY</h3>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <MapPin size={20} />
            <span>{emergencyLocation}</span>
          </div>
          {fireEvent && (
            <div className="mt-2 text-lg">
              <span>Confidence: {Math.round(fireEvent.confidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Live Feed */}
        <Card className="mb-6 bg-black/50 border-emergency-foreground/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-emergency-foreground">Live Feed - {emergencyRobot}</h3>
              <div className="bg-emergency px-3 py-1 rounded text-sm font-bold animate-pulse">
                FIRE DETECTED
              </div>
            </div>
            <div className="relative">
              <img
                src={factoryFeed4}
                alt="Emergency camera feed"
                className="w-full h-48 object-cover rounded border-2 border-emergency"
              />
              <div className="absolute inset-0 bg-emergency/20 rounded"></div>
              <div className="absolute top-2 left-2 bg-emergency text-emergency-foreground px-2 py-1 rounded text-sm font-bold animate-pulse">
                FIRE ZONE
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4 mb-6">
          <Button 
            onClick={handleCallEmergency}
            className="w-full h-14 text-xl font-bold bg-emergency hover:bg-emergency/90 border-2 border-emergency-foreground text-emergency-foreground"
          >
            <Phone className="mr-3" size={24} />
            CALL EMERGENCY SERVICES
          </Button>

          <Button 
            onClick={handleResolve}
            variant="outline"
            className="w-full h-12 border-emergency-foreground text-emergency-foreground hover:bg-emergency-foreground hover:text-emergency"
          >
            <AlertTriangle className="mr-2" size={20} />
            MARK RESOLVED
          </Button>
        </div>

        {/* Emergency Info */}
        <Card className="bg-black/50 border-emergency-foreground/30">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-emergency-foreground mb-3">Emergency Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Alert ID:</span>
                <span className="font-mono">ALT-EMG-001</span>
              </div>
              <div className="flex justify-between">
                <span>Detection Time:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Robot ID:</span>
                <span className="font-mono">{emergencyRobot}</span>
              </div>
              <div className="flex justify-between">
                <span>Severity:</span>
                <span className="font-bold text-emergency-foreground">CRITICAL</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={alertActive ? "text-emergency-foreground font-bold" : "text-success"}>
                  {alertActive ? "ACTIVE" : "RESOLVED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold">{emergencyLocation}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Emergency;