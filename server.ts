import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure media directory exists for the "Real" media server
  const mediaPath = path.join(process.cwd(), "media");
  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
    // Create some dummy files for demonstration
    fs.writeFileSync(path.join(mediaPath, "Welcome_Video.mp4"), "dummy content");
    fs.writeFileSync(path.join(mediaPath, "Home_Ambience.mp3"), "dummy content");
  }

  // Mock Data Generators
  let devices = [
    { id: "1", name: "Main Gateway", ip: "192.168.1.1", mac: "00:1A:2B:3C:4D:5E", type: "Router", status: "online", manufacturer: "Cisco", model: "ISR 4331", os: "IOS-XE", latency: "1ms", throughput: "1.2 Gbps", lastSeen: new Date().toISOString() },
    { id: "2", name: "Synology NAS", ip: "127.0.0.1", mac: "00:11:32:44:55:66", type: "Storage", status: "online", manufacturer: "Synology", model: "DS920+", os: "DSM 7.1", storage: "12TB / 16TB", latency: "2ms", throughput: "850 Mbps", lastSeen: new Date().toISOString(), isMounted: true },
    { id: "3", name: "HP LaserJet Pro", ip: "192.168.1.15", mac: "A4:5D:36:77:88:99", type: "Printer", status: "online", manufacturer: "HP", model: "M404dn", os: "Proprietary", inkLevel: "45%", latency: "5ms", throughput: "10 Mbps", lastSeen: new Date().toISOString() },
    { id: "4", name: "Workstation-01", ip: "192.168.1.101", mac: "D8:BB:C1:AA:BB:CC", type: "Workstation", status: "online", manufacturer: "Dell", model: "Precision 5820", os: "Windows 11 Pro", latency: "3ms", throughput: "450 Mbps", lastSeen: new Date().toISOString() },
    { id: "5", name: "MacBook-Pro-M3", ip: "192.168.1.102", mac: "F0:18:98:DD:EE:FF", type: "Laptop", status: "online", manufacturer: "Apple", model: "MacBook Pro 16", os: "macOS Sonoma", latency: "8ms", throughput: "320 Mbps", lastSeen: new Date().toISOString() },
    { id: "6", name: "Smart-TV-Living", ip: "192.168.1.105", mac: "BC:D1:1F:11:22:33", type: "IoT", status: "offline", manufacturer: "Samsung", model: "QN90A", os: "Tizen", latency: "N/A", throughput: "0 Mbps", lastSeen: "2024-03-20T10:00:00Z" },
    { id: "7", name: "Hue-Bridge", ip: "192.168.1.20", mac: "00:17:88:AA:BB:CC", type: "IoT", status: "online", manufacturer: "Philips", model: "Hue Bridge v2", os: "Linux", latency: "15ms", throughput: "1 Mbps", lastSeen: new Date().toISOString() },
  ];

  let iotDevices = [
    { id: "iot1", name: "Living Room Lights", type: "Light", status: "on", brightness: 80, color: "#ffffff" },
    { id: "iot2", name: "Kitchen Thermostat", type: "Thermostat", status: "online", temperature: 22, targetTemperature: 21 },
    { id: "iot3", name: "Front Door Lock", type: "Lock", status: "locked" },
    { id: "iot4", name: "Security Camera", type: "Camera", status: "online", recording: true },
  ];

  let printJobs = [
    { id: "pj1", document: "Q1_Report.pdf", user: "Admin", status: "completed", pages: 12 },
    { id: "pj2", document: "Network_Diagram.png", user: "Engineer", status: "printing", pages: 1 },
    { id: "pj3", document: "Invoice_772.docx", user: "Finance", status: "pending", pages: 3 },
  ];

  const alerts = [
    { id: "a1", type: "warning", message: "High latency detected on MacBook-Pro-M3", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), deviceId: "5" },
    { id: "a2", type: "critical", message: "Unauthorized login attempt on Synology NAS", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), deviceId: "2" },
    { id: "a3", type: "info", message: "New device discovered: Hue-Bridge", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), deviceId: "7" },
  ];

  // API Routes
  app.get("/api/devices", (req, res) => {
    res.json(devices);
  });

  app.post("/api/devices/scan", async (req, res) => {
    // Real-ish network scan: Try to ping the gateway or some local IPs
    try {
      // In a container, we might only see 127.0.0.1 or the local bridge
      const { stdout } = await execAsync("ping -c 1 127.0.0.1");
      const match = stdout.match(/time=([\d.]+) ms/);
      const latency = match ? match[1] + "ms" : "1ms";

      const newDevice = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: "Discovered-Node-" + Math.floor(Math.random() * 100), 
        ip: "192.168.1." + (150 + Math.floor(Math.random() * 50)), 
        mac: "00:AA:BB:CC:DD:EE", 
        type: "IoT", 
        status: "online", 
        manufacturer: "Generic", 
        model: "v1.0", 
        os: "Linux", 
        latency: latency, 
        throughput: "12 Mbps", 
        lastSeen: new Date().toISOString() 
      };
      devices.push(newDevice);
      res.json(newDevice);
    } catch (err) {
      res.status(500).json({ error: "Network scan failed" });
    }
  });

  app.get("/api/storage/:deviceId/files", (req, res) => {
    const deviceId = req.params.deviceId;
    const device = devices.find(d => d.id === deviceId);
    
    // If it's the "Real" NAS (Synology), we use the actual filesystem
    if (device && (device.name.includes("Synology") || device.ip === "127.0.0.1")) {
      const relativePath = (req.query.path as string) || ".";
      const normalizedPath = relativePath === "root" ? "." : relativePath;
      const safePath = path.normalize(normalizedPath).replace(/^(\.\.[\/\\])+/, "");
      const absolutePath = path.join(process.cwd(), safePath);

      try {
        const items = fs.readdirSync(absolutePath, { withFileTypes: true });
        const files = items.map(item => {
          const stats = fs.statSync(path.join(absolutePath, item.name));
          return {
            name: item.name,
            type: item.isDirectory() ? "directory" : "file",
            size: item.isDirectory() ? "--" : (stats.size / 1024).toFixed(1) + " KB",
            modified: stats.mtime.toISOString().replace("T", " ").substr(0, 16)
          };
        });
        return res.json(files);
      } catch (err) {
        return res.status(500).json({ error: "Failed to read directory" });
      }
    }

    // Fallback for other mock devices
    res.json([]);
  });

  app.get("/api/media/library", (req, res) => {
    // Real media scanner: Scan the ./media directory
    try {
      const items = fs.readdirSync(mediaPath, { withFileTypes: true });
      const mediaFiles = items
        .filter(item => !item.isDirectory())
        .map(item => {
          const stats = fs.statSync(path.join(mediaPath, item.name));
          const ext = path.extname(item.name).toLowerCase();
          let type = "unknown";
          if ([".mp4", ".mkv", ".avi"].includes(ext)) type = "video";
          if ([".mp3", ".wav", ".flac"].includes(ext)) type = "audio";
          if ([".jpg", ".png", ".gif"].includes(ext)) type = "image";

          return {
            name: item.name,
            type: type,
            size: (stats.size / (1024 * 1024)).toFixed(1) + " MB",
            modified: stats.mtime.toISOString().replace("T", " ").substr(0, 16),
            thumbnail: `https://picsum.photos/seed/${item.name}/200/300`
          };
        });
      res.json(mediaFiles);
    } catch (err) {
      res.status(500).json({ error: "Failed to scan media library" });
    }
  });

  app.get("/api/iot/devices", (req, res) => {
    res.json(iotDevices);
  });

  app.post("/api/iot/control", (req, res) => {
    const { id, action, value } = req.body;
    const device = iotDevices.find(d => d.id === id);
    if (device) {
      if (action === "toggle") device.status = device.status === "on" ? "off" : "on";
      if (action === "setBrightness") (device as any).brightness = value;
      if (action === "setTemp") (device as any).targetTemperature = value;
      if (action === "toggleLock") device.status = device.status === "locked" ? "unlocked" : "locked";
    }
    res.json({ status: "success", device });
  });

  app.post("/api/storage/:deviceId/mount", (req, res) => {
    const { deviceId } = req.params;
    const device = devices.find(d => d.id === deviceId);
    if (device) device.isMounted = true;
    res.json({ status: "success", message: "Device mounted successfully" });
  });

  app.post("/api/storage/:deviceId/unmount", (req, res) => {
    const { deviceId } = req.params;
    const device = devices.find(d => d.id === deviceId);
    if (device) device.isMounted = false;
    res.json({ status: "success", message: "Device unmounted successfully" });
  });

  app.get("/api/printer/:deviceId/jobs", (req, res) => {
    res.json(printJobs);
  });

  app.post("/api/printer/:deviceId/print", (req, res) => {
    const { document, pages } = req.body;
    const newJob = { id: "pj" + Date.now(), document, user: "Admin", status: "pending", pages };
    printJobs.unshift(newJob);
    res.json(newJob);
  });

  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      activeDevices: devices.filter(d => d.status === "online").length,
      totalDevices: devices.length,
      bandwidthUsage: "450 Mbps",
      avgLatency: "4.2ms",
      uptime: "14d 6h 22m",
      networkHealth: 94
    });
  });

  app.get("/api/troubleshoot/:deviceId", (req, res) => {
    const { deviceId } = req.params;
    const device = devices.find(d => d.id === deviceId);
    if (!device) return res.status(404).json({ error: "Device not found" });

    // Mock logs for AI analysis
    const logs = [
      `[INFO] ${new Date().toISOString()} - Connection established with ${device.ip}`,
      `[WARN] ${new Date().toISOString()} - Packet loss detected (12%)`,
      `[ERROR] ${new Date().toISOString()} - Handshake timeout on port 443`,
      `[INFO] ${new Date().toISOString()} - Retrying connection...`,
      `[DEBUG] ${new Date().toISOString()} - MTU size mismatch detected (1500 vs 1492)`,
    ];
    res.json({ device, logs });
  });

  app.post("/api/remote-command", (req, res) => {
    const { deviceId, command } = req.body;
    res.json({ status: "success", output: `Executed '${command}' on device ${deviceId}. Result: Command acknowledged.` });
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
