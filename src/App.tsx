import React, { useState, useEffect } from "react";
import { Device, Alert, NetworkStats } from "./lib/types";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { StatCard } from "./components/dashboard/StatCard";
import { NetworkMap } from "./components/network/NetworkMap";
import { DeviceDetails } from "./components/network/DeviceDetails";
import { Troubleshooter } from "./components/network/Troubleshooter";
import { StorageManager } from "./components/storage/StorageManager";
import { PrinterManager } from "./components/printer/PrinterManager";
import { RemoteAccessSetup } from "./components/system/RemoteAccessSetup";
import { SecurityCenter } from "./components/system/SecurityCenter";
import { SystemConfig } from "./components/system/SystemConfig";
import { MediaServer } from "./components/media/MediaServer";
import { SmartHome } from "./components/home/SmartHome";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Shield, 
  Search, 
  Activity, 
  Cpu, 
  Zap, 
  RefreshCw,
  Wifi,
  Database,
  Printer,
  Monitor,
  Laptop,
  Settings
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "remote" | "security" | "config" | "media" | "home">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = async () => {
    try {
      const [devRes, alertRes, statRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/alerts"),
        fetch("/api/stats")
      ]);
      const [devData, alertData, statData] = await Promise.all([
        devRes.json(),
        alertRes.json(),
        statRes.json()
      ]);
      setDevices(devData);
      setAlerts(alertData);
      setStats(statData);
      
      if (selectedDevice) {
        const updated = devData.find((d: Device) => d.id === selectedDevice.id);
        if (updated) setSelectedDevice(updated);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast.error("Failed to connect to network hub.");
    } finally {
      setLoading(false);
    }
  };

  const scanNetwork = async () => {
    toast.promise(
      fetch("/api/devices/scan", { method: "POST" }).then(res => res.json()),
      {
        loading: 'Scanning network for new devices...',
        success: (data) => {
          fetchData();
          return `Discovered new device: ${data.name}`;
        },
        error: 'Scan failed. Check gateway connectivity.',
      }
    );
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical": return <Shield className="w-4 h-4 text-red-500" />;
      case "warning": return <Activity className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "Router": return <Wifi className="w-4 h-4 text-blue-500" />;
      case "Storage": return <Database className="w-4 h-4 text-purple-500" />;
      case "Printer": return <Printer className="w-4 h-4 text-zinc-400" />;
      case "Workstation": return <Monitor className="w-4 h-4 text-blue-400" />;
      case "Laptop": return <Laptop className="w-4 h-4 text-zinc-300" />;
      case "IoT": return <LayoutDashboard className="w-4 h-4 text-orange-500" />;
      default: return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" theme="dark" />
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          alerts={alerts} 
        />

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {activeView === "remote" && <RemoteAccessSetup />}
            {activeView === "security" && <SecurityCenter />}
            {activeView === "config" && <SystemConfig />}
            {activeView === "media" && <MediaServer />}
            {activeView === "home" && <SmartHome />}
            
            {activeView === "dashboard" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    icon={<Activity className="text-blue-500" />} 
                    label="Active Devices" 
                    value={stats?.activeDevices || 0} 
                    subValue={`of ${stats?.totalDevices || 0} total`}
                  />
                  <StatCard 
                    icon={<Zap className="text-yellow-500" />} 
                    label="Network Load" 
                    value={stats?.bandwidthUsage || "0 Mbps"} 
                    subValue="Real-time throughput"
                  />
                  <StatCard 
                    icon={<Cpu className="text-purple-500" />} 
                    label="Avg Latency" 
                    value={stats?.avgLatency || "0ms"} 
                    subValue="ICMP Round Trip"
                  />
                  <StatCard 
                    icon={<Shield className="text-green-500" />} 
                    label="Health Score" 
                    value={`${stats?.networkHealth || 0}%`} 
                    subValue="System integrity"
                    progress={stats?.networkHealth}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <NetworkMap 
                      devices={devices} 
                      onSelectDevice={setSelectedDevice} 
                      selectedDeviceId={selectedDevice?.id}
                    />
                    
                    <Card className="border-border bg-card/50">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold">Device Inventory</CardTitle>
                          <p className="text-xs text-muted-foreground">Detailed specifications of all network nodes.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2" onClick={scanNetwork}>
                            <Search className="w-4 h-4" /> Scan Network
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchData(); }}>
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 col-header">Device Name</th>
                                <th className="text-left py-3 px-4 col-header">IP Address</th>
                                <th className="text-left py-3 px-4 col-header">Type</th>
                                <th className="text-left py-3 px-4 col-header">Status</th>
                                <th className="text-left py-3 px-4 col-header">Latency</th>
                                <th className="text-right py-3 px-4 col-header">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {devices.map((device) => (
                                <tr 
                                  key={device.id} 
                                  onClick={() => setSelectedDevice(device)}
                                  className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors ${selectedDevice?.id === device.id ? 'bg-blue-500/5' : ''}`}
                                >
                                  <td className="py-3 px-4 font-medium">
                                    <div className="flex items-center gap-3">
                                      <div className="p-1.5 rounded-md bg-muted/50">
                                        {getDeviceIcon(device.type)}
                                      </div>
                                      {device.name}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{device.ip}</td>
                                  <td className="py-3 px-4">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">
                                      {device.type}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-zinc-600'}`} />
                                      <span className="text-xs capitalize">{device.status}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-xs">{device.latency}</td>
                                  <td className="py-3 px-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                                      Manage
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    {selectedDevice ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <DeviceDetails device={selectedDevice} />
                        {selectedDevice.type === "Storage" && <StorageManager device={selectedDevice} />}
                        {selectedDevice.type === "Printer" && <PrinterManager device={selectedDevice} />}
                        <Troubleshooter device={selectedDevice} />
                      </motion.div>
                    ) : (
                      <Card className="border-dashed border-2 border-border bg-transparent">
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">No Device Selected</CardTitle>
                            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto mt-2">
                              Select a node from the topology map or inventory to view real-time diagnostics.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="border-border bg-card/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold">System Alerts</CardTitle>
                          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                            {alerts.length} Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          <div className="divide-y divide-border">
                            {alerts.map((alert) => (
                              <div key={alert.id} className="p-4 hover:bg-muted/20 transition-colors space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getAlertIcon(alert.type)}
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                      alert.type === 'critical' ? 'text-red-500' : 
                                      alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                    }`}>
                                      {alert.type}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">{alert.message}</p>
                                <p className="text-xs text-muted-foreground">Device ID: {alert.deviceId}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
