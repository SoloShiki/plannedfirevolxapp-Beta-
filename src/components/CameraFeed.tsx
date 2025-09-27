import { Card } from "@/components/ui/card";
import { useState } from "react";

interface CameraFeedProps {
  id: string;
  name: string;
  status: "active" | "alert" | "offline";
  streamUrl: string;
  location: string;
}

export const CameraFeed = ({ id, name, status, streamUrl, location }: CameraFeedProps) => {
  const [streamError, setStreamError] = useState(false);
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-status-active";
      case "alert":
        return "bg-status-alert";
      case "offline":
        return "bg-status-offline";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "alert":
        return "ALERT";
      case "offline":
        return "OFFLINE";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:bg-card/80 transition-colors">
      <div className="relative">
        {!streamError && streamUrl ? (
          <iframe
            src={streamUrl}
            className="w-full h-32 border-0"
            title={`${name} live stream`}
            allow="camera; microphone"
            onError={() => setStreamError(true)}
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-muted-foreground">Live Feed</p>
            </div>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getStatusColor()} text-white`}>
          {getStatusText()}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          ID: {id}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{location}</p>
      </div>
    </Card>
  );
};