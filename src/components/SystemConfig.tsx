import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Settings, Server, Database, Network, Save, RotateCcw, Cpu, HardDrive } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { toast } from "sonner";

export const SystemConfig: React.FC = () => {
  const handleSave = () => {
    toast.success("System configuration updated successfully.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-zinc-400" /> System Configuration
          </h2>
          <p className="text-sm text-muted-foreground">Manage core hub parameters and hardware allocation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" /> Hub Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hub-name" className="text-xs uppercase tracking-wider font-bold opacity-70">Hub Hostname</Label>
              <Input id="hub-name" defaultValue="NETHUB-CORE-01" className="bg-background/50 font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-xs uppercase tracking-wider font-bold opacity-70">Local Domain</Label>
              <Input id="domain" defaultValue="hub.local" className="bg-background/50 font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-500" /> Network Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold opacity-70">MTU Size (Bytes)</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[1500]} max={9000} min={576} step={1} className="flex-1" />
                <span className="text-xs font-mono w-12 text-right">1500</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold opacity-70">DHCP Lease Time (Hours)</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[24]} max={168} min={1} step={1} className="flex-1" />
                <span className="text-xs font-mono w-12 text-right">24h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-yellow-500" /> Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold opacity-70">CPU Core Limit</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[4]} max={16} min={1} step={1} className="flex-1" />
                <span className="text-xs font-mono w-12 text-right">4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" /> Database Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium">Log Retention</p>
                <p className="text-[10px] text-muted-foreground">Keep diagnostic logs for 30 days.</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[10px]">Purge Now</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium">Auto-Backup</p>
                <p className="text-[10px] text-muted-foreground">Weekly cloud synchronization.</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[10px]">Backup Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info("Settings reset to defaults.")}>
          <RotateCcw className="w-4 h-4" /> Reset Defaults
        </Button>
        <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Configuration
        </Button>
      </div>
    </div>
  );
};
