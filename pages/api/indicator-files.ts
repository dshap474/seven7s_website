import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const files = fs.readdirSync(dataDir);
  const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'bitcoin.json');
  res.status(200).json(jsonFiles);
}
