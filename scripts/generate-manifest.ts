import fs from 'fs';
import path from 'path';

const intelligenceDir = path.join(process.cwd(), 'public', 'intelligence_data');
const manifestPath = path.join(intelligenceDir, 'manifest.json');

// Ensure directory exists
if (!fs.existsSync(intelligenceDir)) {
  fs.mkdirSync(intelligenceDir, { recursive: true });
}

// Get all .txt files in the directory
const files = fs.readdirSync(intelligenceDir)
  .filter(file => file.endsWith('.txt'))
  .sort((a, b) => b.localeCompare(a));

// Write the manifest file with proper JSON formatting
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));

console.log(`Generated manifest with ${files.length} files at ${manifestPath}`); 