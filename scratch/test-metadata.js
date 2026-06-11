const fs = require('fs');
const path = require('path');
const https = require('https');

function cleanJpegLossless(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.length;

  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    throw new Error("Invalid JPEG signature");
  }

  const outputParts = [];
  outputParts.push(bytes.slice(0, 2)); // Keep SOI marker (0xFFD8)

  let offset = 2;
  while (offset < len) {
    if (offset + 1 >= len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    if (bytes[offset] !== 0xFF) {
      let nextMarker = offset;
      while (nextMarker < len && bytes[nextMarker] !== 0xFF) {
        nextMarker++;
      }
      outputParts.push(bytes.slice(offset, nextMarker));
      offset = nextMarker;
      continue;
    }

    const marker = bytes[offset + 1];

    if (marker === 0xFF) {
      outputParts.push(bytes.slice(offset, offset + 1));
      offset++;
      continue;
    }

    if (marker === 0x00) {
      outputParts.push(bytes.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    if (marker === 0xDA || marker === 0xD9) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) {
      outputParts.push(bytes.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    if (offset + 3 >= len) {
      outputParts.push(bytes.slice(offset));
      break;
    }
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];

    // Strip APP1 (0xE1 - EXIF/XMP) and APP13 (0xED - IPTC)
    if (marker === 0xE1 || marker === 0xED) {
      console.log(`Skipped JPEG marker 0xFF${marker.toString(16).toUpperCase()} of size ${size}`);
    } else {
      outputParts.push(bytes.slice(offset, offset + 2 + size));
    }

    offset += 2 + size;
  }

  // Node equivalent of returning ArrayBuffer from parts
  let totalLength = 0;
  for (const part of outputParts) {
    totalLength += part.length;
  }
  const resultBytes = new Uint8Array(totalLength);
  let writeOffset = 0;
  for (const part of outputParts) {
    resultBytes.set(part, writeOffset);
    writeOffset += part.length;
  }
  return resultBytes;
}

async function runTest() {
  const exifr = (await import('exifr')).default;

  const testJpgUrl = 'https://raw.githubusercontent.com/ianare/exif-samples/master/jpg/gps/DSCN0010.jpg';
  const localJpgPath = path.join(__dirname, 'DSCN0010.jpg');
  const cleanedJpgPath = path.join(__dirname, 'DSCN0010-cleaned.jpg');

  console.log('Downloading test image with GPS metadata from:', testJpgUrl);

  const file = fs.createWriteStream(localJpgPath);
  await new Promise((resolve, reject) => {
    https.get(testJpgUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(localJpgPath, () => {});
      reject(err);
    });
  });

  console.log('File downloaded successfully.');

  // 1. Read metadata from original image
  const originalBuffer = fs.readFileSync(localJpgPath);
  const originalArrayBuffer = originalBuffer.buffer.slice(
    originalBuffer.byteOffset,
    originalBuffer.byteOffset + originalBuffer.byteLength
  );

  console.log('Original File Size:', originalBuffer.length, 'bytes');

  let origMeta = await exifr.parse(originalArrayBuffer, true);
  let origGps = await exifr.gps(originalArrayBuffer);

  console.log('--- Original Metadata ---');
  console.log('Make:', origMeta?.Make);
  console.log('Model:', origMeta?.Model);
  console.log('GPS Coordinates:', origGps);

  if (!origGps || typeof origGps.latitude !== 'number') {
    throw new Error('Test image did not contain GPS coordinates! Check sample image source.');
  }

  // 2. Run Lossless Stripping
  console.log('\nRunning cleanJpegLossless...');
  const cleanedBytes = cleanJpegLossless(originalArrayBuffer);
  fs.writeFileSync(cleanedJpgPath, cleanedBytes);
  console.log('Cleaned image written to:', cleanedJpgPath);
  console.log('Cleaned File Size:', cleanedBytes.length, 'bytes');
  console.log('Size Difference:', originalBuffer.length - cleanedBytes.length, 'bytes removed');

  // 3. Re-read metadata from cleaned image
  const cleanedArrayBuffer = cleanedBytes.buffer.slice(
    cleanedBytes.byteOffset,
    cleanedBytes.byteOffset + cleanedBytes.byteLength
  );
  let cleanMeta = await exifr.parse(cleanedArrayBuffer, true);
  let cleanGps = await exifr.gps(cleanedArrayBuffer);

  console.log('--- Cleaned Metadata ---');
  console.log('Make:', cleanMeta?.Make);
  console.log('Model:', cleanMeta?.Model);
  console.log('GPS Coordinates:', cleanGps);
  console.log('Total Fields Found in Cleaned:', cleanMeta ? Object.keys(cleanMeta).length : 0);

  if (cleanMeta || cleanGps) {
    console.error('FAIL: Metadata was NOT fully stripped!');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All metadata successfully removed! Image remains a valid JPEG.');
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
