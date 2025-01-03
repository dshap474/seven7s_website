const fs = require('fs');
const path = require('path');

const intelligenceDir = path.join(__dirname, '../public/intelligence_data');
const files = fs.readdirSync(intelligenceDir)
  .filter(file => file.endsWith('.json'))
  .filter(file => file !== 'directory.json');

fs.writeFileSync(
  path.join(intelligenceDir, 'directory.json'),
  JSON.stringify(files, null, 2)
); 