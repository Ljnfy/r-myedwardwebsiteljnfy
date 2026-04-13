export interface FileItem {
  name: string;
  size: string;
  type: "file" | "directory";
  modified: string;
}

export interface PrintJob {
  id: string;
  document: string;
  user: string;
  status: "pending" | "printing" | "completed";
  pages: number;
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: string;
  status: "online" | "offline";
  manufacturer: string;
  model: string;
  os: string;
  latency: string;
  throughput: string;
  lastSeen: string;
  storage?: string;
  inkLevel?: string;
  isMounted?: boolean;
}

export interface Alert {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  deviceId: string;
}

export interface NetworkStats {
  activeDevices: number;
  totalDevices: number;
  bandwidthUsage: string;
  avgLatency: string;
  uptime: string;
  networkHealth: number;
}
