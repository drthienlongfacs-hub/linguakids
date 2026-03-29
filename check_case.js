const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file.startsWith('.')) continue;
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      fileList = walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = walk(path.join(process.cwd(), 'src'));
let hasError = false;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const imports = [...content.matchAll(/import.*?from\s+['"]([^'"]+)['"]/g), ...content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)];
  
  imports.forEach(match => {
    let importPath = match[1];
    if (importPath.startsWith('.')) {
      if (!importPath.endsWith('.jsx') && !importPath.endsWith('.js') && !importPath.endsWith('.css')) {
        // Assume extension could be jsx, js, ts, tsx or a directory
        importPath += '.jsx'; // Simplification for test
      }
      
      const absoluteTarget = path.resolve(dir, importPath);
      // Remove the .jsx to check against real files
      const basename = path.basename(absoluteTarget, '.jsx');
      const dirname = path.dirname(absoluteTarget);
      
      try {
        const actualFiles = fs.readdirSync(dirname);
        const matchFile = actualFiles.find(f => f.toLowerCase() === basename.toLowerCase() + '.jsx' || f.toLowerCase() === basename.toLowerCase() + '.js' || f === basename);
        if (matchFile && !actualFiles.includes(path.basename(absoluteTarget).replace('.jsx', '') + path.extname(matchFile)) && !actualFiles.includes(basename)) {
            let actualNameWithoutExt = matchFile.replace(/\.(jsx|js)$/, '');
            if (basename !== actualNameWithoutExt) {
                console.log(`CASE ERROR in ${file}: imported '${match[1]}' but actual file is '${matchFile}'`);
                hasError = true;
            }
        }
      } catch(e) {}
    }
  });
});
if (!hasError) console.log("No case mismatches found!");
