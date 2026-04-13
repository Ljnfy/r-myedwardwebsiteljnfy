import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Unlock, 
  Camera, 
  Power, 
  Settings2, 
  Home,
  Droplets,
  Wind,
  Sun,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  status: string;
  brightness?: number;
  color?: string;
  temperature?: number;
  targetTemperature?: number;
  recording?: boolean;
}

export const SmartHome: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/iot/devices");
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      toast.error("Failed to load IoT devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const controlDevice = async (id: string, action: string, value?: any) => {
    try {
      const res = await fetch("/api/iot/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, value })
      });
      const data = await res.json();
      if (data.status === "success") {
        setDevices(prev => prev.map(d => d.id === id ? data.device : d));
      }
    } catch (err) {
      toast.error("Failed to communicate with device.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Light": return <Lightbulb className="w-5 h-5" />;
      case "Thermostat": return <Thermometer className="w-5 h-5" />;
      case "Lock": return <Lock className="w-5 h-5" />;
      case "Camera": return <Camera className="w-5 h-5" />;
      default: return <Power className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Home className="w-6 h-6 text-orange-500" /> Smart Home Control
          </h2>
          <p className="text-sm text-muted-foreground">Manage IoT devices and home automation protocols.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Sun className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-mono text-orange-500">ZIGBEE MESH ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-border">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Humidity</p>
              <p className="text-xl font-mono font-bold">42%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Temp</p>
              <p className="text-xl font-mono font-bold">21.5°C</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Air Quality</p>
              <p className="text-xl font-mono font-bold">Excellent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Energy Usage</p>
              <p className="text-xl font-mono font-bold">1.2 kW</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="border-border bg-card/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${device.status === 'on' || device.status === 'online' || device.status === 'locked' ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
                    {getIcon(device.type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">{device.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-wider">{device.type}</CardDescription>
                  </div>
                </div>
                {device.type === "Light" || device.type === "Lock" ? (
                  <Switch 
                    checked={device.status === "on" || device.status === "locked"} 
                    onCheckedChange={() => controlDevice(device.id, device.type === "Light" ? "toggle" : "toggleLock")}
                  />
                ) : (
                  <Badge variant="outline" className="text-[10px]">{device.status.toUpperCase()}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {device.type === "Light" && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Brightness</span>
                    <span className="font-mono">{device.brightness}%</span>
                  </div>
                  <Slider 
                    value={[device.brightness || 0]} 
                    max={100} 
                    onValueChange={(val: number[]) => controlDevice(device.id, "setBrightness", val[0])}
                  />
                </div>
              )}

              {device.type === "Thermostat" && (
                <div className="space-y-4">
                  <div className="flex justify-around items-center py-2">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">Current</p>
                      <p className="text-2xl font-mono font-bold">{device.temperature}°C</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">Target</p>
                      <p className="text-2xl font-mono font-bold text-orange-500">{device.targetTemperature}°C</p>
                    </div>
                  </div>
                  <Slider 
                    value={[device.targetTemperature || 0]} 
                    max={30} 
                    min={15} 
                    step={0.5}
                    onValueChange={(val: number[]) => controlDevice(device.id, "setTemp", val[0])}
                  />
                </div>
              )}

              {device.type === "Camera" && (
                <div className="aspect-video bg-black rounded-lg relative overflow-hidden group">
                  <img 
                    src={`https://picsum.photos/seed/${device.id}/640/360`} 
                    className="w-full h-full object-cover opacity-60"
                    alt="Camera Feed"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-white bg-black/50 px-1.5 rounded">REC</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <Button size="sm" variant="secondary" className="text-xs gap-2">
                      <Camera className="w-3 h-3" /> View Live Feed
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] gap-2">
                  <Settings2 className="w-3 h-3" /> Config
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] gap-2">
                  <Activity className="w-3 h-3" /> History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
