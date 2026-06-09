const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function download() {
  const version = "1.7.0";
  const url = `https://staticimgly.com/@imgly/background-removal-data/${version}/package.tgz`;
  const tempFile = path.join(__dirname, 'package.tgz');
  const tempDir = path.join(__dirname, 'temp_package');
  const destDir = path.join(__dirname, 'public', 'bg-remover-assets');

  console.log(`Downloading background remover assets (${version}) from IMG.LY CDN...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download assets: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(tempFile, Buffer.from(buffer));

  console.log('Extracting assets...');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Use native tar command (built-in on Windows 10+, macOS, and Linux)
  execSync(`tar -xzf "${tempFile}" -C "${tempDir}"`);

  const distFolder = path.join(tempDir, 'package', 'dist');
  if (!fs.existsSync(distFolder)) {
    throw new Error('Extracted package did not contain a dist folder.');
  }

  console.log('Copying assets to public/bg-remover-assets...');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // Recursively copy contents
  fs.cpSync(distFolder, destDir, { recursive: true });

  console.log('Cleaning up temporary files...');
  try {
    fs.rmSync(tempFile, { force: true });
  } catch (err) {
    console.warn(`[Warning] Failed to clean up temp file package.tgz: ${err.message}`);
  }
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`[Warning] Failed to clean up temp dir temp_package: ${err.message}`);
  }

  console.log('Background Remover assets successfully self-hosted in public/bg-remover-assets!');
}

download().catch(err => {
  console.error('Failed to download or host assets:', err);
  process.exit(1);
});
