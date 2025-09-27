import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Flame, Droplets, Thermometer, Zap, Wrench, Eye } from "lucide-react";

const detectionPackages = [
  {
    id: "PKG-001",
    name: "Fire Detection Pro",
    description: "Advanced fire and smoke detection with thermal imaging analysis",
    version: "v2.1.3",
    size: "45.2 MB",
    installed: true,
    category: "Fire Safety",
    icon: <Flame className="text-emergency" size={24} />,
    features: ["Smoke detection", "Thermal imaging", "Real-time alerts", "False alarm reduction"]
  },
  {
    id: "PKG-002", 
    name: "Unsafe Condition Prevention",
    description: "Detects unsafe behaviors and conditions in industrial environments",
    version: "v2.3.1",
    size: "35.4 MB",
    installed: true,
    category: "Behavioral Safety",
    icon: <Eye className="text-warning" size={24} />,
    features: ["Smoking detection", "PPE compliance", "Unsafe posture detection", "Restricted area monitoring"]
  }
];

const DetectionPackages = () => {
  return (
    <Layout>
      <div className="p-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Detection Packages</h1>
          <p className="text-muted-foreground">Industry-specific AI detection modules</p>
        </div>

        <div className="grid gap-4">
          {detectionPackages.map((pkg) => (
            <Card key={pkg.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {pkg.icon}
                    <div>
                      <CardTitle className="text-lg text-foreground">{pkg.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{pkg.category}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pkg.installed ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle size={12} className="mr-1" />
                        INSTALLED
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                        <Download size={14} className="mr-1" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground mb-4">{pkg.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <span className="ml-2 text-foreground font-medium">{pkg.version}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 text-foreground font-medium">{pkg.size}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DetectionPackages;