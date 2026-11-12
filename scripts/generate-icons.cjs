const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function makePng(width, height, drawPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive
  ihdr[12] = 0; // no interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', idatData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

function renderSchoolIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.44;

  // Background
  if (!isMaskable) {
    // Rounded rect or circle
    const cornerR = w * 0.22;
    const inBox =
      Math.abs(dx) <= cx - cornerR ||
      Math.abs(dy) <= cy - cornerR ||
      Math.hypot(Math.abs(dx) - (cx - cornerR), Math.abs(dy) - (cy - cornerR)) <= cornerR;

    if (!inBox) {
      return [0, 0, 0, 0];
    }
  }

  // Gradient emerald background
  const t = (y / h);
  const rBg = Math.round(4 * (1 - t) + 6 * t);
  const gBg = Math.round(120 * (1 - t) + 80 * t);
  const bBg = Math.round(87 * (1 - t) + 60 * t);

  // Inner ring
  const innerR = w * (isMaskable ? 0.35 : 0.38);
  if (Math.abs(dist - innerR) < w * 0.015) {
    return [255, 255, 255, 230];
  }

  // Draw an open book / education icon in center
  const sc = w / 100;
  const nx = (x - cx) / sc;
  const ny = (y - cy) / sc;

  // Book pages: -24 to 24, -12 to 14
  if (ny >= -10 && ny <= 16) {
    // Spine
    if (Math.abs(nx) <= 1.5) {
      return [245, 158, 11, 255]; // gold spine
    }
    // Left & Right Pages
    if (Math.abs(nx) <= 22) {
      const pageBottom = 12 - Math.pow(Math.abs(nx) / 22, 1.3) * 3;
      const pageTop = -8 + Math.pow(Math.abs(nx) / 22, 1.2) * 2;
      if (ny >= pageTop && ny <= pageBottom) {
        // Page lines
        const isLine = Math.floor(ny) % 4 === 0 && Math.abs(nx) > 5 && Math.abs(nx) < 18;
        if (isLine) {
          return [16, 185, 129, 255]; // green line
        }
        return [255, 255, 255, 255]; // white paper
      }
    }
  }

  // Graduation cap / star above
  if (ny >= -24 && ny <= -12) {
    // Diamond top
    const capW = (ny - (-24)) * 1.8;
    if (Math.abs(nx) <= capW && Math.abs(nx) <= (12 - (ny - (-18))) * 2.2) {
      return [251, 191, 36, 255]; // amber/gold cap
    }
  }

  return [rBg, gBg, bBg, 255];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const png192 = makePng(192, 192, (x, y, w, h) => renderSchoolIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512
const png512 = makePng(512, 512, (x, y, w, h) => renderSchoolIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate maskable 512x512
const pngMaskable = makePng(512, 512, (x, y, w, h) => renderSchoolIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// Generate apple-touch-icon 180x180
const pngApple = makePng(180, 180, (x, y, w, h) => renderSchoolIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// Generate favicon.ico (can use 192 as png)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('PWA PNG icons generated successfully in public/');
