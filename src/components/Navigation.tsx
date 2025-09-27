import { NavLink } from "react-router-dom";
import { Camera, AlertTriangle, Settings, Package } from "lucide-react";

export const Navigation = () => {
  const navItems = [
    { path: "/", icon: Camera, label: "Live Feeds" },
    { path: "/alerts", icon: AlertTriangle, label: "Alerts" },
    { path: "/packages", icon: Package, label: "Detection" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};