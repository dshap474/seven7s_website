import chokidar from 'chokidar';
import { exec } from 'child_process';

const watcher = chokidar.watch('public/intelligence_data/*.txt', {
  persistent: true
});

console.log('Watching for file changes...');

watcher.on('all', (event, path) => {
  console.log(`Detected ${event} in ${path}`);
  exec('npm run generate-manifest', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(stdout);
  });
}); 