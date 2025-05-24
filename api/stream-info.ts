
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const primaryStreamUrl = "http://katolikusradio.hu:9000/radetzkyfm";
const fallbackStreamUrl = "https://katolikusradio.hu:8001/radetzkyfm";

async function checkStreamAvailable(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url, { responseType: 'stream', timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const metadataResponse = await axios.get("http://katolikusradio.hu:9000/status-json.xsl");
    const metadata = metadataResponse.data;
    const sources = metadata.icestats.source;
    let radetzkyfmData = null;

    if (Array.isArray(sources)) {
      radetzkyfmData = sources.find(
        (source) => source.server_name === "RadetzkyFM" || source.listenurl?.includes("radetzkyfm")
      );
    } else if (sources && (sources.server_name === "RadetzkyFM" || sources.listenurl?.includes("radetzkyfm"))) {
      radetzkyfmData = sources;
    }

    let streamUrlToUse = primaryStreamUrl;
    const primaryAvailable = await checkStreamAvailable(primaryStreamUrl);
    if (!primaryAvailable) {
      const fallbackAvailable = await checkStreamAvailable(fallbackStreamUrl);
      if (fallbackAvailable) {
        streamUrlToUse = fallbackStreamUrl;
      } else {
        return res.status(500).json({ error: "Can't connect to stream" });
      }
    }

    res.json({
      streamUrl: streamUrlToUse,
      stationName: radetzkyfmData?.server_name || "RadetzkyFM",
      description: radetzkyfmData?.server_description || "Catholic Radio Stream",
      currentTrack: radetzkyfmData?.title || "Unknown Track",
      bitrate: radetzkyfmData?.bitrate || 96,
      genre: radetzkyfmData?.genre || "Music",
      listeners: radetzkyfmData?.listeners || 0,
      serverType: radetzkyfmData?.server_type || "audio/aac"
    });

  } catch (error) {
    res.status(500).json({
      error: "Can't connect to stream"
    });
  }
}
