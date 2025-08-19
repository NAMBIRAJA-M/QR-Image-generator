import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure images directory exists
const imagesDir = path.join(__dirname, "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// History file path
const historyFile = path.join(__dirname, "qr-history.json");

// Load history from file
function loadHistory() {
  try {
    if (fs.existsSync(historyFile)) {
      const data = fs.readFileSync(historyFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  return [];
}

// Save history to file
function saveHistory(history) {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

// Initialize history
let qrHistory = loadHistory();

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint for generating QR codes
app.post("/api/generate-qr", async (req, res) => {
  try {
    const { type, content, options = {} } = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ error: "Type and content are required" });
    }

    let qrContent = "";
    
    // Generate different types of QR codes
    switch (type) {
      case "url":
        qrContent = content;
        break;
      case "text":
        qrContent = content;
        break;
      case "email":
        qrContent = `mailto:${content}`;
        break;
      case "phone":
        qrContent = `tel:${content}`;
        break;
      case "sms":
        qrContent = `sms:${content}`;
        break;
      case "wifi":
        const { ssid, password, encryption = "WPA" } = content;
        qrContent = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
        break;
      case "vcard":
        const { name, phone, email, company } = content;
        qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nORG:${company}\nEND:VCARD`;
        break;
      case "geolocation":
        const { latitude, longitude } = content;
        qrContent = `geo:${latitude},${longitude}`;
        break;
      default:
        return res.status(400).json({ error: "Invalid QR code type" });
    }

    // Generate unique filename
    const filename = `qr_${uuidv4()}.png`;
    const filepath = path.join(imagesDir, filename);

    // QR code options
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: 'image/png',
      quality: 0.92,
      margin: options.margin || 1,
      color: {
        dark: options.foregroundColor || '#000000',
        light: options.backgroundColor || '#FFFFFF'
      },
      width: options.width || 300
    };

    // Generate QR code
    await QRCode.toFile(filepath, qrContent, qrOptions);

    res.json({
      success: true,
      filename: filename,
      url: `/images/${filename}`,
      content: qrContent,
      type: type
    });

  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Endpoint to get QR code history
app.get("/api/history", (req, res) => {
  try {
    // Reload history from file to ensure we have the latest data
    qrHistory = loadHistory();
    res.json(qrHistory.slice(-20)); // Return last 20 QR codes
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

app.post("/api/save-to-history", (req, res) => {
  try {
    const { filename, content, type, timestamp } = req.body;
    const newEntry = { 
      filename, 
      content, 
      type, 
      timestamp: timestamp || new Date().toISOString() 
    };
    
    // Add to history array
    qrHistory.push(newEntry);
    
    // Keep only last 50 entries to prevent file from growing too large
    if (qrHistory.length > 50) {
      qrHistory = qrHistory.slice(-50);
    }
    
    // Save to file
    saveHistory(qrHistory);
    
    console.log('Saved to history:', newEntry);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving to history:', error);
    res.status(500).json({ error: "Failed to save to history" });
  }
});

// Endpoint to get QR code statistics
app.get("/api/stats", (req, res) => {
  try {
    // Reload history from file
    qrHistory = loadHistory();
    
    const files = fs.readdirSync(imagesDir);
    const stats = {
      totalGenerated: qrHistory.length,
      typesGenerated: qrHistory.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: qrHistory.slice(-5)
    };
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`🚀 QR Generator server running on port ${port}`);
  console.log(`📱 Open http://localhost:${port} to use the application`);
  console.log(`📊 History file: ${historyFile}`);
});
