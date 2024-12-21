import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/api/intelligence-files', (req, res) => {
  try {
    const directoryPath = path.join(process.cwd(), 'public', 'intelligence_data');
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.endsWith('.txt'));
    
    res.json(files);
  } catch (error) {
    console.error('Error reading intelligence files:', error);
    res.status(500).json({ error: 'Failed to read intelligence files' });
  }
});

export default router; 