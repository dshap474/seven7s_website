import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default async function handler(req: Request, res: Response) {
  try {
    const directoryPath = path.join(process.cwd(), 'public/intelligence_data');
    const files = fs.readdirSync(directoryPath);
    
    // Get latest files for each type
    const getLatestFile = (prefix: string) => {
      const matchingFiles = files.filter(file => file.includes(prefix));
      return matchingFiles.sort().reverse()[0] || null;
    };

    const latestFiles = {
      meta: getLatestFile('meta_summary'),
      newsletter: getLatestFile('newsletters_daily_summary'),
      youtube: getLatestFile('youtube_transcripts_daily_summary')
    };

    res.status(200).json(latestFiles);
  } catch (error) {
    console.error('Error reading intelligence files:', error);
    res.status(500).json({ error: 'Failed to read intelligence files' });
  }
} 