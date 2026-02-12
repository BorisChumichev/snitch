const fs = require('fs')
const path = require('path')

/**
 * Post-build: add .js extensions to all relative import/export paths
 * in the ESM build output. Node's ESM resolver requires explicit
 * file extensions, unlike CJS which auto-resolves them.
 */
function fixImports(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      fixImports(fullPath)
    } else if (entry.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      // Match: from './foo' or from '../foo/bar'
      // Skip if already ends in .js
      content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+)(?<!\.js)(['"])/g, '$1$2.js$3')
      fs.writeFileSync(fullPath, content)
    }
  }
}

const esmDir = path.join(__dirname, '..', 'dist', 'esm')
if (fs.existsSync(esmDir)) {
  fixImports(esmDir)
  // Write a package.json so Node treats .js files in this dir as ESM
  fs.writeFileSync(
    path.join(esmDir, 'package.json'),
    JSON.stringify({ type: 'module' }, null, 2) + '\n',
  )
  console.log('Fixed ESM import extensions in', esmDir)
}
