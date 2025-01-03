import fs from 'fs';
import path from 'path';

const intelligenceDir = path.join(process.cwd(), 'public/intelligence_data');

// Get all .json files from the directory
const files = fs.readdirSync(intelligenceDir)
  .filter(file => file.endsWith('.json'))
  .filter(file => file !== 'manifest.json'); // Exclude manifest.json itself

// Sort files by date (newest first)
files.sort((a, b) => {
  const dateA = a.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
  const dateB = b.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
  return dateB.localeCompare(dateA);
});

// Write the manifest file
fs.writeFileSync(
  path.join(intelligenceDir, 'manifest.json'),
  JSON.stringify(files, null, 2)
);

console.log('Generated manifest.json with', files.length, 'files'); 