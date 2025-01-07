import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INTELLIGENCE_DIR = path.join(__dirname, '../public/intelligence_data');

function verifyJsonFiles() {
  const files = fs.readdirSync(INTELLIGENCE_DIR)
    .filter(file => file.endsWith('.json'));

  let hasErrors = false;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(INTELLIGENCE_DIR, file), 'utf8');
      JSON.parse(content); // Verify JSON is valid
      console.log(`✓ ${file} is valid JSON`);
    } catch (error) {
      hasErrors = true;
      console.error(`✗ ${file} is invalid JSON:`, error.message);
    }
  });

  if (hasErrors) {
    process.exit(1);
  }
}

verifyJsonFiles(); 