import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up CORS for the audio stream
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Stream info endpoint
  app.get('/api/stream-info', (req, res) => {
    res.json({
      streamUrl: 'https://katolikusradio.hu:8001/radetzkyfm',
      stationName: 'RadetzkyFM',
      description: 'Catholic Radio Stream'
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
