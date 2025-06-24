const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, '..', 'app', 'api', 'auth');

// Remove NextAuth specific directories
const dirsToRemove = [
  '[...nextauth]',
  'callback',
  'signin',
  'signup'
];

// Remove each directory
for (const dir of dirsToRemove) {
  const dirPath = path.join(authDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing directory: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

// Remove the login route if it's a NextAuth one
const loginRoute = path.join(authDir, 'login', 'route.ts');
if (fs.existsSync(loginRoute)) {
  const content = fs.readFileSync(loginRoute, 'utf8');
  if (content.includes('next-auth')) {
    console.log(`Removing NextAuth login route: ${loginRoute}`);
    fs.unlinkSync(loginRoute);
    // Remove the login directory if it's empty
    const loginDir = path.join(authDir, 'login');
    if (fs.readdirSync(loginDir).length === 0) {
      fs.rmdirSync(loginDir);
    }
  }
}

// Remove the auth directory if it's empty
if (fs.existsSync(authDir) && fs.readdirSync(authDir).length === 0) {
  console.log(`Removing empty auth directory: ${authDir}`);
  fs.rmdirSync(authDir);
}

console.log('Cleanup complete!');
