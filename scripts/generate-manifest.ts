import fs from 'fs';
import path from 'path';

const intelligenceDir = path.join(process.cwd(), 'public', 'intelligence_data');
const manifestPath = path.join(intelligenceDir, 'manifest.json');

console.log('Intelligence directory:', intelligenceDir);

// Get all .txt files in the directory
const files = fs.readdirSync(intelligenceDir)
  .filter(file => file.endsWith('.txt'))
  .sort((a, b) => b.localeCompare(a)); // Sort in reverse alphabetical order

console.log('Found txt files:', files);

// Write the manifest file
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));

console.log(`Generated manifest with ${files.length} files at ${manifestPath}`); 