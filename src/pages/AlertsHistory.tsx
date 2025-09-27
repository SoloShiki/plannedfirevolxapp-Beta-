import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, Wrench, Zap } from "lucide-react";

const mockAlerts: any[] = [];

const AlertsHistory = () => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "fire":
        return <Flame className="text-emergency" size={20} />;
      case "safety":
        return <AlertTriangle className="text-warning" size={20} />;
      case "equipment":
        return <Wrench className="text-warning" size={20} />;
      case "electrical":
        return <Zap className="text-warning" size={20} />;
      default:
        return <AlertTriangle className="text-muted-foreground" size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-emergency text-emergency-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "medium":
        return "bg-status-standby text-black";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emergency text-emergency-foreground";
      case "resolved":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Alert History</h1>
          <p className="text-muted-foreground">Recent safety alerts and incidents</p>
        </div>

        <div className="space-y-4">
          {mockAlerts.length === 0 ? (
            <Card className="p-8 border-border text-center">
              <div className="text-muted-foreground">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Alerts Yet</h3>
                <p>All systems are operating normally. Alert history will appear here when incidents are detected.</p>
              </div>
            </Card>
          ) : (
            mockAlerts.map((alert) => (
              <Card key={alert.id} className="p-4 border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h3 className="font-semibold text-foreground">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">Robot ID: {alert.robotId}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-foreground mb-3">{alert.description}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">ID: {alert.id}</span>
                  <span className="text-muted-foreground">{alert.timestamp}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AlertsHistory;