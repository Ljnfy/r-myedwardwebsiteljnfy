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

  // Load configuration from files
  const configPath = path.join(process.cwd(), "config", "network.json");
  let config = { devices: [], iot: [] };
  
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (err) {
    console.error("Failed to load config, using empty defaults", err);
  }

  let devices = config.devices;
  let iotDevices = config.iot;

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
