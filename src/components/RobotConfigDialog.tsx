import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RobotConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (robotData: {
    name: string;
    location: string;
    wifiNetwork: string;
    wifiPassword: string;
    status: 'online' | 'offline' | 'alert';
    ipAddress?: string;
  }) => void;
  initialData?: {
    name: string;
    location: string;
    wifiNetwork: string;
    wifiPassword: string;
    ipAddress?: string;
  } | null;
}

export const RobotConfigDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: RobotConfigDialogProps) => {
  const [robotId, setRobotId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [wifiNetwork, setWifiNetwork] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
      setWifiNetwork(initialData.wifiNetwork);
      setWifiPassword(initialData.wifiPassword);
      setIpAddress(initialData.ipAddress || "");
    } else {
      setRobotId("");
      setName("");
      setLocation("");
      setWifiNetwork("");
      setWifiPassword("");
      setIpAddress("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!name || !location || !wifiNetwork) return;

    onSubmit({
      name,
      location,
      wifiNetwork,
      wifiPassword,
      status: 'online',
      ipAddress: ipAddress || `192.168.1.${Math.floor(Math.random() * 100) + 100}`
    });

    // Reset form
    setRobotId("");
    setName("");
    setLocation("");
    setWifiNetwork("");
    setWifiPassword("");
    setIpAddress("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Robot" : "Add Robot"}
          </DialogTitle>
          <DialogDescription>
            Configure robot settings. Only the essential fields are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!initialData && (
            <div>
              <Label htmlFor="robot-id">Robot ID</Label>
              <Input
                id="robot-id"
                value={robotId}
                onChange={(e) => setRobotId(e.target.value)}
                placeholder="RBT-004"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="robot-name">Robot Name</Label>
            <Input
              id="robot-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patrol Robot Delta"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Warehouse Section D"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="wifi-network">WiFi Network</Label>
            <Input
              id="wifi-network"
              value={wifiNetwork}
              onChange={(e) => setWifiNetwork(e.target.value)}
              placeholder="Factory-WiFi"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="wifi-password">WiFi Password</Label>
            <Input
              id="wifi-password"
              type="password"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ip-address">IP Address (Manual Override)</Label>
            <Input
              id="ip-address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.100"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name || !location || !wifiNetwork}
            className="bg-primary hover:bg-primary/90"
          >
            {initialData ? "Update Robot" : "Add Robot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};