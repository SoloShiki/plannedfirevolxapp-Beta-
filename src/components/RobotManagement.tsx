import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, Wifi, Signal } from "lucide-react";
import { RobotConfigDialog } from "./RobotConfigDialog";
import { useSettings, Robot } from "@/hooks/useSettings";

export const RobotManagement = () => {
  const { settings, saveSettings } = useSettings();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingRobot, setEditingRobot] = useState<Robot | null>(null);

  const handleAddRobot = (robotData: Omit<Robot, 'id'>) => {
    const newRobot = {
      ...robotData,
      id: `RBT-${String(settings.robots.length + 1).padStart(3, '0')}`
    };
    const updatedRobots = [...settings.robots, newRobot];
    saveSettings({ robots: updatedRobots });
    setIsConfigOpen(false);
  };

  const handleEditRobot = (robotData: Omit<Robot, 'id'>) => {
    if (editingRobot) {
      const updatedRobots = settings.robots.map(robot =>
        robot.id === editingRobot.id ? { ...robotData, id: editingRobot.id } : robot
      );
      saveSettings({ robots: updatedRobots });
      setEditingRobot(null);
      setIsConfigOpen(false);
    }
  };

  const handleDeleteRobot = (robotId: string) => {
    const updatedRobots = settings.robots.filter(robot => robot.id !== robotId);
    saveSettings({ robots: updatedRobots });
  };

  const handleConfigureRobot = (robot: Robot) => {
    setEditingRobot(robot);
    setIsConfigOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
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
              <Wifi className="text-primary" size={20} />
              <span>Robot Management</span>
            </CardTitle>
            <CardDescription>Configure and monitor your Firevolx robots</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingRobot(null);
              setIsConfigOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Robot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {settings.robots.map((robot) => (
            <Card key={robot.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Wifi className="text-primary" size={20} />
                    <div>
                      <CardTitle className="text-base text-foreground">{robot.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{robot.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(robot.status)}>
                      {robot.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Robot ID:</span>
                    <span className="ml-2 text-foreground font-medium">{robot.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP:</span>
                    <span className="ml-2 text-foreground font-medium">{robot.ipAddress || 'Not assigned'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">WiFi Network:</span>
                    <span className="ml-2 text-foreground font-medium">{robot.wifiNetwork || 'Not configured'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Signal className={robot.status === 'online' ? 'text-status-active' : 'text-status-offline'} size={16} />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConfigureRobot(robot)}
                  >
                    <Settings size={14} className="mr-1" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteRobot(robot.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <RobotConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        onSubmit={editingRobot ? handleEditRobot : handleAddRobot}
        initialData={editingRobot}
      />
    </Card>
  );
};