import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTELLIGENCE_DIR = path.join(__dirname, '..', 'public', 'intelligence_data');
const MANIFEST_PATH = path.join(INTELLIGENCE_DIR, 'manifest.json');

// Get all JSON files in the intelligence directory
const files = fs.readdirSync(INTELLIGENCE_DIR)
  .filter(file => file.endsWith('.json'))
  .filter(file => !['manifest.json', 'ai-manifest.json'].includes(file))
  // Sort files by date (newest first)
  .sort((a, b) => {
    const dateA = a.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    const dateB = b.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    return dateB.localeCompare(dateA);
  });

// Write the manifest file
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(files, null, 2));

console.log(`Generated manifest with ${files.length} files`); 