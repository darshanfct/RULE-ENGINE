import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const docsRoot = path.join(__dirname, 'public', 'docs');
const outputFilePath = path.join(__dirname, 'public', 'navTree.json');

function generateNavTree() {
  console.log('Generating navigation tree...');

  if (!fs.existsSync(docsRoot)) {
    console.warn('Docs directory not found at:', docsRoot);
    writeJson({ versions: [], navTree: {} });
    return;
  }

  // Get all projects (directories in public/docs)
  const projects = fs.readdirSync(docsRoot)
    .filter(file => fs.statSync(path.join(docsRoot, file)).isDirectory());

  // Collect all unique versions across all projects
  const allVersions = new Set();
  projects.forEach(project => {
    const projectPath = path.join(docsRoot, project);
    const projectVersions = fs.readdirSync(projectPath)
      .filter(file => fs.statSync(path.join(projectPath, file)).isDirectory());
    projectVersions.forEach(v => allVersions.add(v));
  });

  const versions = Array.from(allVersions).sort((a, b) => {
    // Sort versions: latest first, then descending versions
    if (a === 'latest') return -1;
    if (b === 'latest') return 1;
    // @ts-ignore
    return b.localeCompare(a, undefined, { numeric: true });
  });

  const navTree = {};

  versions.forEach(version => {
    // @ts-ignore
    navTree[version] = [];
    
    projects.forEach(project => {
      // @ts-ignore
      const projectVersionPath = path.join(docsRoot, project, version);
      
      if (fs.existsSync(projectVersionPath)) {
        // Pass the relative path from docsRoot so that the final path includes project/version
        // e.g. RULE-ENGINE/latest
        // @ts-ignore
        const relativePath = path.join(project, version);
        const projectItems = getNavItems(projectVersionPath, relativePath);
        
        // Create a parent item for the project
        // Clean up project name for label (replace -_ with space, capitalize)
        const projectLabel = project.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const projectId = project.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // If project has items, add it to the tree
        if (projectItems.length > 0) {
          // @ts-ignore
          navTree[version].push({
            id: projectId,
            label: projectLabel,
            children: projectItems,
            // If we want the project itself to be clickable, we could set a path to the first child
            // But usually a folder parent just expands/collapses
            path: projectItems[0]?.path || '' 
          });
        }
      }
    });
  });

  writeJson({ versions, navTree });
  console.log('Navigation tree generated successfully at public/navTree.json');
}

function writeJson(data) {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
}

// Helper to recursively scan directories
function getNavItems(dirPath, relativePath = '') {
  if (!fs.existsSync(dirPath)) return [];

  const items = fs.readdirSync(dirPath)
    .filter(file => !file.startsWith('.')) // Ignore hidden files
    .sort((a, b) => {
       // Sort by numeric prefix if present
       const numA = parseInt(a.match(/^\d+/)?.[0] || '999');
       const numB = parseInt(b.match(/^\d+/)?.[0] || '999');
       return numA - numB;
    });

  const navItems = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    // Clean up name for label
    // Remove leading numbers (01., 02.)
    // Replace - and _ with space
    // Remove extension
    let cleanName = item.replace(/^\d+\./, '')
                    .replace(/\.md$/, '')
                    .replace(/[-_]/g, ' ');
    
    // Capitalize first letter of each word
    let label = cleanName.replace(/\b\w/g, l => l.toUpperCase());

    // Create ID from the full relative path to ensure uniqueness across the tree
    // This prevents collisions if two projects have the same folder structure (e.g. "01.getting-started")
    const uniquePath = path.join(relativePath, item);
    const id = uniquePath.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (stat.isDirectory()) {
      const children = getNavItems(fullPath, path.join(relativePath, item));
      
      // If directory is empty, skip it
      if (children.length === 0) continue;

      // Find the "main" file for this directory (e.g. 01.getting-started/01.getting-started.md)
      // It usually matches the folder name (ignoring prefix)
      
      let mainFileIndex = -1;
      
      // Try to find exact match first (id matches folder id)
      // @ts-ignore
      mainFileIndex = children.findIndex(c => c.id === id);
      
      let mainFilePath = '';
      let filteredChildren = children;

      if (mainFileIndex !== -1) {
          // Main file found (exact match)
          // @ts-ignore
          mainFilePath = children[mainFileIndex].path;
          // Remove main file from children list
          filteredChildren = children.filter((_, index) => index !== mainFileIndex);
          
          // If there are no other children (besides the main file), flatten.
          if (filteredChildren.length === 0) {
               navItems.push({
                  id,
                  label,
                  path: mainFilePath
               });
               continue; // Done with this item
          }
      } else {
          // No main file found.
          // Use the first child's path for the folder itself (so clicking it does something useful)
          // But keep ALL children in the list.
          if (children.length > 0) {
              // @ts-ignore
              mainFilePath = children[0].path;
          }
          filteredChildren = children;
      }

      // Add folder item with children
      navItems.push({
          id,
          label,
          path: mainFilePath, 
          children: filteredChildren
      });

    } else if (item.endsWith('.md')) {
      navItems.push({
        id,
        label,
        path: path.join(relativePath, item).replace(/\\/g, '/') // Ensure forward slashes
      });
    }
  }

  return navItems;
}

generateNavTree();
