import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";

export const SecurityCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" /> Security Center
          </h2>
          <p className="text-sm text-muted-foreground">Monitor and harden your network perimeter.</p>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
          SECURE
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Threat Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold text-green-400">LOW</p>
            <Progress value={15} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Firewall Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold text-blue-400">ACTIVE</p>
            <p className="text-[10px] text-muted-foreground mt-1">Blocking 12 IPs</p>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Encryption</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono font-bold">WPA3-SAE</p>
            <p className="text-[10px] text-muted-foreground mt-1">AES-CCMP Enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Active Security Policies</CardTitle>
          <CardDescription>Configure real-time protection mechanisms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Intrusion Prevention System (IPS)</span>
              </div>
              <p className="text-xs text-muted-foreground">Automatically block suspicious traffic patterns.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Deep Packet Inspection</span>
              </div>
              <p className="text-xs text-muted-foreground">Analyze application-layer data for malware.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Guest Network Isolation</span>
              </div>
              <p className="text-xs text-muted-foreground">Prevent guest devices from accessing local resources.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" className="gap-2 h-12">
          <RefreshCw className="w-4 h-4" /> Run Security Audit
        </Button>
        <Button className="gap-2 h-12 bg-blue-600 hover:bg-blue-700">
          <ShieldAlert className="w-4 h-4" /> View Incident Logs
        </Button>
      </div>
    </div>
  );
};
