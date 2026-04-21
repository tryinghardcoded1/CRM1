import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src/components/common');
const srcDir = path.join(process.cwd(), 'src');
const files = fs.readdirSync(dir);

const replacements = [];

for (const file of files) {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const baseName = file.replace('.tsx', '').replace('.ts', '');
    // Only prefix if it doesn't already have 'app-'
    if (!baseName.startsWith('app-')) {
      const newBaseName = 'app-' + baseName;
      const newFile = file.replace(baseName, newBaseName);
      fs.renameSync(path.join(dir, file), path.join(dir, newFile));
      replacements.push([baseName, newBaseName]);
    }
  }
}

function processDir(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldName, newName] of replacements) {
        // match exactly `@/components/common/oldName`
        const regex = new RegExp(`@/components/common/${oldName}([\'"])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `@/components/common/${newName}$1`);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(srcDir);
console.log('Renamed all UI components to app- prefix and updated imports.');
