import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const INTELLIGENCE_DIR = path.join(__dirname, '../public/intelligence_data');

// Function to generate manifests
async function generateManifests() {
  try {
    // Ensure directory exists
    if (!fs.existsSync(INTELLIGENCE_DIR)) {
      console.error('Intelligence directory not found:', INTELLIGENCE_DIR);
      process.exit(1);
    }

    // Read all JSON files
    const files = fs.readdirSync(INTELLIGENCE_DIR)
      .filter(file => file.endsWith('.json'))
      .filter(file => !['manifest.json', 'ai-manifest.json', 'intelligence-manifest.json'].includes(file));

    // Separate files into categories
    const aiFiles = files.filter(file => file.includes('meta-summary'));
    const intelligenceFiles = files.filter(file => !file.includes('meta-summary'));

    // Sort files by date (newest first)
    const sortFiles = (files: string[]) => {
      return files.sort((a, b) => {
        const dateA = a.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
        const dateB = b.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
        return dateB.localeCompare(dateA);
      });
    };

    // Write intelligence-manifest.json
    fs.writeFileSync(
      path.join(INTELLIGENCE_DIR, 'intelligence-manifest.json'),
      JSON.stringify(sortFiles(intelligenceFiles), null, 2)
    );

    // Write ai-manifest.json
    fs.writeFileSync(
      path.join(INTELLIGENCE_DIR, 'ai-manifest.json'),
      JSON.stringify({
        files: sortFiles(aiFiles),
        lastUpdated: new Date().toISOString()
      }, null, 2)
    );

    console.log('Successfully generated manifests');
    console.log(`- Intelligence files: ${intelligenceFiles.length}`);
    console.log(`- AI files: ${aiFiles.length}`);

  } catch (error) {
    console.error('Error generating manifests:', error);
    process.exit(1);
  }
}

generateManifests(); 