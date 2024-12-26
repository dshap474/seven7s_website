import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync, statSync, rmSync } from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to remove platform-specific packages
function removePlatformSpecificPackages() {
  const nodeModulesPath = join(dirname(__dirname), 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    return;
  }

  const platformSpecificPatterns = [
    '*-win32-*',
    '*-darwin-*',
    '*-linux-*'
  ];

  function searchAndRemove(dir) {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (platformSpecificPatterns.some(pattern => 
          file.includes(pattern.replace('*', '')))) {
          rmSync(fullPath, { recursive: true, force: true });
        } else {
          searchAndRemove(fullPath);
        }
      }
    });
  }

  searchAndRemove(nodeModulesPath);
}

removePlatformSpecificPackages(); 