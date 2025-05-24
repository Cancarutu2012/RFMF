import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

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
      streamUrl: 'http://katolikusradio.hu:9000/radetzkyfm',
      stationName: 'RadetzkyFM',
      description: 'Catholic Radio Stream'
    });
  });

  // Proxy endpoint for audio stream to avoid CORS issues
  app.get('/api/proxy-stream', async (req: Request, res: Response) => {
    const url = req.query.url as string;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    try {
      console.log('Proxying stream from:', url);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      });
      
      // Set headers from original response
      Object.keys(response.headers).forEach(header => {
        res.setHeader(header, response.headers[header]);
      });
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      
      // Pipe the stream response
      response.data.pipe(res);
    } catch (error) {
      console.error('Error proxying stream:', error);
      res.status(500).json({ error: 'Failed to proxy stream' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
