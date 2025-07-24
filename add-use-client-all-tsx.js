const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

function getAllFiles(dir, ext = ['.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ext));
    } else if (ext.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

function addUseClientToFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith("'use client'")) {
    const newContent = `'use client';\n` + content;
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Added use client to:', file);
  }
}

const files = getAllFiles(SRC_DIR);
files.forEach(addUseClientToFile);

console.log('Fertig! Alle .tsx-Dateien wurden angepasst.'); 