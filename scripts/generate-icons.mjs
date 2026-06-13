import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";

const outDir = join(process.cwd(), "public", "icons");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

function drawIcon(size) {
  const background = hexToRgb("#1f7a4f");
  const cream = hexToRgb("#f7fff4");
  const gold = hexToRgb("#f7d35d");
  const pixels = Buffer.alloc(size * size * 4);

  const setPixel = (x, y, color) => {
    const index = (y * size + x) * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = 255;
  };

  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          setPixel(x, y, color);
        }
      }
    }
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      setPixel(x, y, background);
    }
  }

  ellipse(size / 2, size / 2, size * 0.33, size * 0.33, cream);
  ellipse(size * 0.52, size * 0.46, size * 0.16, size * 0.24, gold);

  const stemWidth = Math.max(4, Math.round(size * 0.035));
  for (let y = Math.round(size * 0.36); y < Math.round(size * 0.75); y += 1) {
    for (let x = Math.round(size * 0.5 - stemWidth / 2); x < Math.round(size * 0.5 + stemWidth / 2); x += 1) {
      setPixel(x, y, background);
    }
  }

  const rawRows = [];
  for (let y = 0; y < size; y += 1) {
    rawRows.push(Buffer.from([0]));
    rawRows.push(pixels.subarray(y * size * 4, (y + 1) * size * 4));
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rawRows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function writeIcon(name, size) {
  const output = join(outDir, name);
  if (existsSync(output)) {
    console.log(`found ${name}`);
    return;
  }
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, drawIcon(size));
  console.log(`generated ${name}`);
}

writeIcon("icon-192.png", 192);
writeIcon("icon-512.png", 512);
writeIcon("apple-touch-icon.png", 180);
