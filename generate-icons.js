/**
 * Generates crisp 192x192 and 512x512 PNG icons (required for Android APK & Desktop PWA)
 * using zero external dependencies (built-in Node.js zlib + fs).
 */
const fs = require("fs");
const zlib = require("zlib");

function createPngBuffer(width, height, bgRgb, fgRgb) {
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  const cornerRadius = Math.round(width * 0.22);

  function isInsideRoundedRect(x, y) {
    const cx = Math.min(Math.max(x, cornerRadius), width - 1 - cornerRadius);
    const cy = Math.min(Math.max(y, cornerRadius), height - 1 - cornerRadius);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= cornerRadius * cornerRadius;
  }

  // Simple bold "N27" pixel glyph grid (15x7)
  const glyph = [
    "100010111011111",
    "110010001000010",
    "101010111000100",
    "100110100001000",
    "100010111001000"
  ];
  const gH = glyph.length;
  const gW = glyph[0].length;
  const scale = Math.floor((width * 0.62) / gW);
  const offsetX = Math.floor((width - gW * scale) / 2);
  const offsetY = Math.floor((height - gH * scale) / 2);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0; // PNG filter: None
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      if (!isInsideRoundedRect(x, y)) {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
        continue;
      }

      const gx = Math.floor((x - offsetX) / scale);
      const gy = Math.floor((y - offsetY) / scale);
      const isText =
        gx >= 0 && gx < gW && gy >= 0 && gy < gH && glyph[gy][gx] === "1";

      const color = isText ? fgRgb : bgRgb;
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
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
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

// #2383e2 = [35, 131, 226], #ffffff = [255, 255, 255]
fs.writeFileSync("icon-192.png", createPngBuffer(192, 192, [35, 131, 226], [255, 255, 255]));
fs.writeFileSync("icon-512.png", createPngBuffer(512, 512, [35, 131, 226], [255, 255, 255]));
console.log("Generated icon-192.png and icon-512.png successfully.");
