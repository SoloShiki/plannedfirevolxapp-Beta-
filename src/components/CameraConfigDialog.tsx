import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";

interface CameraConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (streamData: {
    name: string;
    streamUrl: string;
    associatedRobot: string;
    status: 'active' | 'alert' | 'offline';
    location: string;
  }) => void;
  initialData?: {
    name: string;
    streamUrl: string;
    associatedRobot: string;
    location: string;
  } | null;
}

export const CameraConfigDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: CameraConfigDialogProps) => {
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [associatedRobot, setAssociatedRobot] = useState("");
  const { settings } = useSettings();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStreamUrl(initialData.streamUrl);
      setAssociatedRobot(initialData.associatedRobot);
    } else {
      setName("");
      setStreamUrl("");
      setAssociatedRobot("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!name || !streamUrl || !associatedRobot) return;

    const robot = settings.robots.find(r => r.id === associatedRobot);
    const location = robot ? robot.location : "Unknown Location";

    onSubmit({
      name,
      streamUrl,
      associatedRobot,
      status: 'active',
      location
    });

    // Reset form
    setName("");
    setStreamUrl("");
    setAssociatedRobot("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Camera Stream" : "Add Camera Stream"}
          </DialogTitle>
          <DialogDescription>
            Configure camera stream settings. Only the essential fields are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="stream-name">Stream Name</Label>
            <Input
              id="stream-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Entrance Camera"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="stream-url">Stream Link</Label>
            <Input
              id="stream-url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://your-camera-stream-url.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="associated-robot">Associated Robot</Label>
            <Select value={associatedRobot} onValueChange={setAssociatedRobot}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select robot" />
              </SelectTrigger>
              <SelectContent>
                {settings.robots.map((robot) => (
                  <SelectItem key={robot.id} value={robot.id}>
                    {robot.name} - {robot.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name || !streamUrl || !associatedRobot}
            className="bg-primary hover:bg-primary/90"
          >
            {initialData ? "Update Stream" : "Add Stream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};