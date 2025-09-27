import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, ExternalLink, Video, Play } from "lucide-react";
import { CameraConfigDialog } from "./CameraConfigDialog";
import { CameraStreamViewer } from "./CameraStreamViewer";
import { useSettings, CameraStream } from "@/hooks/useSettings";

export const CameraStreaming = () => {
  const { settings, saveSettings } = useSettings();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<CameraStream | null>(null);
  const [viewingStream, setViewingStream] = useState<CameraStream | null>(null);

  const handleAddStream = (streamData: Omit<CameraStream, 'id'>) => {
    const newStream = {
      ...streamData,
      id: `CAM-${String(settings.cameraStreams.length + 1).padStart(3, '0')}`
    };
    const updatedStreams = [...settings.cameraStreams, newStream];
    saveSettings({ cameraStreams: updatedStreams });
    setIsConfigOpen(false);
  };

  const handleEditStream = (streamData: Omit<CameraStream, 'id'>) => {
    if (editingStream) {
      const updatedStreams = settings.cameraStreams.map(stream =>
        stream.id === editingStream.id ? { ...streamData, id: editingStream.id } : stream
      );
      saveSettings({ cameraStreams: updatedStreams });
      setEditingStream(null);
      setIsConfigOpen(false);
    }
  };

  const handleDeleteStream = (streamId: string) => {
    const updatedStreams = settings.cameraStreams.filter(stream => stream.id !== streamId);
    saveSettings({ cameraStreams: updatedStreams });
  };

  const handleConfigureStream = (stream: CameraStream) => {
    setEditingStream(stream);
    setIsConfigOpen(true);
  };

  const handleViewStream = (stream: CameraStream) => {
    setViewingStream(stream);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-status-active text-white";
      case "alert":
        return "bg-status-alert text-white";
      case "offline":
        return "bg-status-offline text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Video className="text-primary" size={20} />
              <span>Camera Streaming</span>
            </CardTitle>
            <CardDescription>Monitor live camera feeds from your robots</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingStream(null);
              setIsConfigOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stream
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {settings.cameraStreams.map((stream) => (
            <Card key={stream.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="text-primary" size={20} />
                    <div>
                      <CardTitle className="text-base text-foreground">{stream.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{stream.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(stream.status)}>
                      {stream.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Stream ID:</span>
                    <span className="ml-2 text-foreground font-medium">{stream.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Associated Robot:</span>
                    <span className="ml-2 text-foreground font-medium">{stream.associatedRobot}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stream URL:</span>
                    <span className="ml-2 text-foreground font-mono text-xs break-all">{stream.streamUrl}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleViewStream(stream)}
                    disabled={stream.status === "offline"}
                  >
                    <Play size={14} className="mr-1" />
                    View Stream
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(stream.streamUrl, '_blank')}
                    disabled={stream.status === "offline"}
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Open
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureStream(stream)}
                  >
                    <Settings size={14} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteStream(stream.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <CameraConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        onSubmit={editingStream ? handleEditStream : handleAddStream}
        initialData={editingStream}
      />

      {viewingStream && (
        <CameraStreamViewer
          stream={viewingStream}
          isOpen={!!viewingStream}
          onOpenChange={(open) => !open && setViewingStream(null)}
        />
      )}
    </Card>
  );
};