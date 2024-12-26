const fs = require('fs');
const path = require('path');

// Function to remove platform-specific packages
function removePlatformSpecificPackages() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    return;
  }

  const platformSpecificPatterns = [
    '*-win32-*',
    '*-darwin-*',
    '*-linux-*'
  ];

  function searchAndRemove(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (platformSpecificPatterns.some(pattern => 
          file.includes(pattern.replace('*', '')))) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          searchAndRemove(fullPath);
        }
      }
    });
  }

  searchAndRemove(nodeModulesPath);
}

removePlatformSpecificPackages(); 