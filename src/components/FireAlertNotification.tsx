import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Siren } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";

interface FireAlertProps {
  isVisible: boolean;
  robotId?: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  onDismiss: () => void;
}

export const FireAlertNotification = ({ isVisible, robotId, severity, onDismiss }: FireAlertProps) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  
  // Find robot and location based on robotId
  const robot = robotId ? settings.robots.find(r => r.id === robotId) : settings.robots[0];
  const location = robot ? robot.location : "Unknown Location";

  useEffect(() => {
    if (isVisible && !isAcknowledged) {
      // Play alert sound if available
      const audio = new Audio();
      audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYgCkuY4fLJeisEI3bB6+GUSAxWquX1xW4gBTRo2+zRfzoFHnbB5OWXQQwSUKPl9rltJAU2adfu1YU+CRxrweTjlUoMFGF+yz2A==";
      audio.play().catch(() => {}); // Ignore errors if audio can't play
      
      toast({
        title: "🔥 FIRE ALERT",
        description: `${severity} severity fire detected at ${location}`,
        variant: "destructive"
      });
    }
  }, [isVisible, isAcknowledged, location, severity, toast]);

  if (!isVisible) return null;

  const getSeverityColor = () => {
    switch (severity) {
      case "HIGH":
        return "border-red-500 bg-red-500/10";
      case "MEDIUM":
        return "border-orange-500 bg-orange-500/10";
      case "LOW":
        return "border-yellow-500 bg-yellow-500/10";
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case "HIGH":
        return <Siren className="h-6 w-6 text-red-500 animate-pulse" />;
      case "MEDIUM":
        return <AlertTriangle className="h-6 w-6 text-orange-500 animate-bounce" />;
      case "LOW":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-5">
      <Alert className={`border-2 ${getSeverityColor()} shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getSeverityIcon()}
            <div>
              <h4 className="font-bold text-lg text-foreground">
                🔥 FIRE DETECTED
              </h4>
              <AlertDescription className="text-foreground">
                <div className="space-y-1">
                  <div><strong>Location:</strong> {location}</div>
                  <div><strong>Severity:</strong> {severity}</div>
                  <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                </div>
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAcknowledged(true);
              onDismiss();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setIsAcknowledged(true);
              // Trigger emergency protocol for specific location only
              if (robot) {
                toast({
                  title: "Emergency Protocol Activated",
                  description: `Contacting emergency services for ${robot.location}...`,
                });
              }
            }}
          >
            Emergency Protocol
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAcknowledged(true);
              onDismiss();
            }}
          >
            Acknowledge
          </Button>
        </div>
      </Alert>
    </div>
  );
};