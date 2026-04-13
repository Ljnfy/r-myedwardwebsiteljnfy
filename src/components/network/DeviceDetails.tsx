import React, { useState } from "react";
import { Device } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Terminal, Settings, Activity, Database, Printer, Monitor, Laptop, Wifi, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeviceDetailsProps {
  device: Device;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device }) => {
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["Connection established.", "Ready for commands..."]);

  const getIcon = (type: string) => {
    switch (type) {
      case "Router": return <Wifi className="w-5 h-5" />;
      case "Storage": return <Database className="w-5 h-5" />;
      case "Printer": return <Printer className="w-5 h-5" />;
      case "Workstation": return <Monitor className="w-5 h-5" />;
      case "Laptop": return <Laptop className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setTerminalOutput(prev => [...prev, `> ${command}`]);
    
    try {
      const res = await fetch("/api/remote-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id, command })
      });
      const data = await res.json();
      setTerminalOutput(prev => [...prev, data.output]);
    } catch (err) {
      setTerminalOutput(prev => [...prev, "Error: Failed to execute command."]);
    }
    
    setCommand("");
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
            {getIcon(device.type)}
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">{device.name}</CardTitle>
            <CardDescription className="font-mono text-xs">{device.ip} • {device.mac}</CardDescription>
          </div>
        </div>
        <Badge variant={device.status === "online" ? "default" : "secondary"} className={device.status === "online" ? "bg-blue-500 hover:bg-blue-600" : ""}>
          {device.status.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Manufacturer</p>
                <p className="text-sm font-medium">{device.manufacturer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Model</p>
                <p className="text-sm font-medium">{device.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Operating System</p>
                <p className="text-sm font-medium">{device.os}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Last Seen</p>
                <p className="text-sm font-medium">{new Date(device.lastSeen).toLocaleString()}</p>
              </div>
            </div>

            {device.storage && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium flex items-center gap-2">
                    <Database className="w-3 h-3" /> Storage Utilization
                  </p>
                  <span className="text-xs font-mono">{device.storage}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[75%]" />
                </div>
              </div>
            )}

            {device.inkLevel && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium flex items-center gap-2">
                    <Printer className="w-3 h-3" /> Ink Levels
                  </p>
                  <span className="text-xs font-mono">{device.inkLevel}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="management" className="space-y-4 pt-4">
            <div className="bg-black rounded-lg border border-border overflow-hidden">
              <div className="bg-zinc-900 px-3 py-1.5 border-bottom border-border flex items-center gap-2">
                <Terminal className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Remote Shell (SSH)</span>
              </div>
              <ScrollArea className="h-48 p-3 font-mono text-xs text-green-500">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="mb-1">{line}</div>
                ))}
              </ScrollArea>
              <form onSubmit={handleCommand} className="p-2 bg-zinc-900 border-t border-border flex gap-2">
                <span className="text-xs font-mono text-zinc-500 pt-1.5">$</span>
                <Input 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="h-8 bg-transparent border-none focus-visible:ring-0 text-xs font-mono p-0"
                  placeholder="Enter command..."
                />
              </form>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-2" onClick={() => toast.success("Reboot command sent")}>
                <Activity className="w-3 h-3" /> Reboot
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-2" onClick={() => toast.success("Scanning for updates...")}>
                <Shield className="w-3 h-3" /> Update Firmware
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded bg-muted/20 border border-border">
                <span className="text-xs text-muted-foreground">ICMP Latency</span>
                <span className="text-xs font-mono text-blue-400">{device.latency}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/20 border border-border">
                <span className="text-xs text-muted-foreground">Current Throughput</span>
                <span className="text-xs font-mono text-green-400">{device.throughput}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/20 border border-border">
                <span className="text-xs text-muted-foreground">Packet Loss</span>
                <span className="text-xs font-mono text-zinc-400">0.02%</span>
              </div>
              <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Potential Issue</p>
                  <p className="text-xs text-muted-foreground">MTU mismatch detected on the upstream gateway. This may cause fragmentation.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
