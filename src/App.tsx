import React, { useState, useEffect } from "react";
import { Device, Alert, NetworkStats } from "./types";
import { NetworkMap } from "./components/NetworkMap";
import { DeviceDetails } from "./components/DeviceDetails";
import { Troubleshooter } from "./components/Troubleshooter";
import { StorageManager } from "./components/StorageManager";
import { PrinterManager } from "./components/PrinterManager";
import { RemoteAccessSetup } from "./components/RemoteAccessSetup";
import { SecurityCenter } from "./components/SecurityCenter";
import { SystemConfig } from "./components/SystemConfig";
import { MediaServer } from "./components/MediaServer";
import { SmartHome } from "./components/SmartHome";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { 
  LayoutDashboard, 
  Network, 
  Shield, 
  Bell, 
  Search, 
  Settings, 
  Globe, 
  Activity, 
  Cpu, 
  Zap, 
  RefreshCw,
  Menu,
  X,
  ChevronRight,
  Film,
  Home,
  Wifi,
  Database,
  Printer,
  Monitor,
  Laptop
} from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

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
      
      // Update selected device if it exists
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
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "Router": return <Wifi className="w-4 h-4 text-blue-500" />;
      case "Storage": return <Database className="w-4 h-4 text-purple-500" />;
      case "Printer": return <Printer className="w-4 h-4 text-zinc-400" />;
      case "Workstation": return <Monitor className="w-4 h-4 text-blue-400" />;
      case "Laptop": return <Laptop className="w-4 h-4 text-zinc-300" />;
      case "IoT": return <Home className="w-4 h-4 text-orange-500" />;
      default: return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="w-72 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col z-50 fixed inset-y-0 lg:relative"
          >
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Network className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">NetHub</h1>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Enterprise Core</p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
              <NavItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Dashboard" 
                active={activeView === "dashboard"} 
                onClick={() => setActiveView("dashboard")} 
              />
              <NavItem 
                icon={<Film className="w-4 h-4" />} 
                label="Media Server" 
                active={activeView === "media"} 
                onClick={() => setActiveView("media")} 
              />
              <NavItem 
                icon={<Home className="w-4 h-4" />} 
                label="Smart Home" 
                active={activeView === "home"} 
                onClick={() => setActiveView("home")} 
              />
              <NavItem 
                icon={<Shield className="w-4 h-4" />} 
                label="Security Center" 
                active={activeView === "security"} 
                onClick={() => setActiveView("security")} 
              />
              <NavItem 
                icon={<Globe className="w-4 h-4" />} 
                label="Remote Access" 
                active={activeView === "remote"} 
                onClick={() => setActiveView("remote")} 
              />
              <NavItem 
                icon={<Settings className="w-4 h-4" />} 
                label="System Config" 
                active={activeView === "config"} 
                onClick={() => setActiveView("config")} 
              />
            </nav>

            <div className="p-4 mt-auto">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">Remote View</span>
                  <div 
                    onClick={() => {
                      const nextView = activeView === "remote" ? "dashboard" : "remote";
                      setActiveView(nextView);
                      toast.info(nextView === "remote" ? "Switched to Remote Management Mode" : "Switched to Local Network");
                    }}
                    className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${activeView === "remote" ? 'bg-blue-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${activeView === "remote" ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {activeView === "remote" ? "Connected via Secure Tunnel (TLS 1.3). Latency may be higher." : "Direct LAN connection established."}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>Network</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">Global Overview</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono">GW: 192.168.1.1</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />}
            </Button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-border flex items-center justify-center text-xs font-bold">
              ED
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {activeView === "remote" && <RemoteAccessSetup />}
            {activeView === "security" && <SecurityCenter />}
            {activeView === "config" && <SystemConfig />}
            {activeView === "media" && <MediaServer />}
            {activeView === "home" && <SmartHome />}
            
            {activeView === "dashboard" && (
              <>
                {/* Stats Grid */}
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
                  {/* Left Column: Network Map & Device List */}
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

                  {/* Right Column: Details & Alerts */}
                  <div className="space-y-6">
                    {selectedDevice ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <DeviceDetails device={selectedDevice} />
                        
                        {selectedDevice.type === "Storage" && (
                          <StorageManager device={selectedDevice} />
                        )}
                        
                        {selectedDevice.type === "Printer" && (
                          <PrinterManager device={selectedDevice} />
                        )}

                        <Troubleshooter device={selectedDevice} />
                      </motion.div>
                    ) : (
                      <Card className="border-border bg-card/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                          <div className="p-4 rounded-full bg-muted/20">
                            <Settings className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-bold">No Device Selected</h3>
                            <p className="text-sm text-muted-foreground">Select a device from the list or map to view details and manage.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="border-border bg-card/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-500" /> Recent Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[300px]">
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

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, subValue, progress }: { icon: React.ReactNode, label: string, value: string | number, subValue: string, progress?: number }) {
  return (
    <Card className="border-border bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
          {progress !== undefined && (
            <div className="w-12 h-12 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-zinc-800"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-blue-500"
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {progress}%
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
}
