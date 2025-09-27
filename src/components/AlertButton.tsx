import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const AlertButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate();

  const handlePress = () => {
    setIsPressed(true);
    // Simulate alert trigger
    setTimeout(() => {
      setIsPressed(false);
      navigate("/emergency");
    }, 500);
  };

  return (
    <Button
      onClick={handlePress}
      className={`w-full h-16 text-xl font-bold bg-emergency hover:bg-emergency/90 border-2 border-emergency-foreground/20 ${
        isPressed ? "scale-95" : ""
      } transition-all duration-200`}
      disabled={isPressed}
    >
      <AlertTriangle className="mr-3" size={24} />
      {isPressed ? "TRIGGERING ALERT..." : "EMERGENCY ALERT"}
    </Button>
  );
};