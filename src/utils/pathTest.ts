const fs = require('fs');
const path = require('path');

const testPath = () => {
  const dirPath = path.join(process.cwd(), 'public', 'intelligence_data');
  
  console.log('Testing path:', dirPath);
  
  if (fs.existsSync(dirPath)) {
    console.log('✅ Directory exists!');
    try {
      const files = fs.readdirSync(dirPath);
      console.log('Files found:', files.length);
      console.log('Sample files:', files.slice(0, 3));
    } catch (err) {
      console.error('❌ Error reading directory:', err);
    }
  } else {
    console.error('❌ Directory not found!');
  }
};

testPath(); 