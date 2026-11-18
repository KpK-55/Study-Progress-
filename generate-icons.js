/**
 * Generates crisp 192x192 and 512x512 PNG icons with an hourglass-in-circle emblem
 * for TIME & TASK TRACKER (Android APK & Desktop PWA) using built-in Node.js zlib + fs.
 */
const fs = require("fs");
const zlib = require("zlib");

function createPngBuffer(width, height) {
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);
  const cornerRadius = Math.round(width * 0.22);
  const cx = width / 2;
  const cy = height / 2;
  const outerRingR = width * 0.36;
  const innerRingR = width * 0.30;

  function isInsideRoundedRect(x, y) {
    const rx = Math.min(Math.max(x, cornerRadius), width - 1 - cornerRadius);
    const ry = Math.min(Math.max(y, cornerRadius), height - 1 - cornerRadius);
    const dx = x - rx;
    const dy = y - ry;
    return dx * dx + dy * dy <= cornerRadius * cornerRadius;
  }

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      if (!isInsideRoundedRect(x, y)) {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
        continue;
      }

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / (width * 0.22);
      const ny = dy / (height * 0.22);

      // Blue circular frame
      const isBlueRing = dist <= outerRingR && dist >= innerRingR;
      // Amber hourglass silhouette inside circle
      const inHourglassY = Math.abs(ny) <= 0.85;
      const hourglassHalfWidth = Math.max(0.14, Math.abs(ny) * 0.88);
      const isTopOrBottomBar = Math.abs(ny) >= 0.72 && Math.abs(ny) <= 0.86 && Math.abs(nx) <= 0.78;
      const isHourglassBody = inHourglassY && Math.abs(nx) <= hourglassHalfWidth && Math.abs(nx) >= hourglassHalfWidth - 0.24;

      let color = [255, 255, 255];
      if (isBlueRing) color = [35, 131, 226];
      else if (isTopOrBottomBar || isHourglassBody) color = [245, 159, 0];

      raw[px] = color[0];
      raw[px + 1] = color[1];
      raw[px + 2] = color[2];
      raw[px + 3] = 255;
    }
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcInput = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < crcInput.length; i++) {
      crc ^= crcInput[i];
      for (let k = 0; k < 8; k++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
    }
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

fs.writeFileSync("icon-192.png", createPngBuffer(192, 192));
fs.writeFileSync("icon-512.png", createPngBuffer(512, 512));
console.log("Generated TIME & TASK TRACKER icon-192.png and icon-512.png successfully.");