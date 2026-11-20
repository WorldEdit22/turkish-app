// Draws the app icon (white crescent and star on red) as PNG and SVG files.
// Usage: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const RED = [227, 10, 23];
const WHITE = [255, 255, 255];
const outer = { x: 0.43, y: 0.5, r: 0.25 };
const inner = { x: 0.492, y: 0.5, r: 0.2 };
const star = { x: 0.705, y: 0.5, r: 0.105 };

const starPoints = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? star.r * 0.382 : star.r;
  const a = Math.PI + (i * Math.PI) / 5; // first point faces the crescent
  return [star.x + r * Math.cos(a), star.y + r * Math.sin(a)];
});

function inPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const inCircle = (x, y, c) => (x - c.x) ** 2 + (y - c.y) ** 2 <= c.r ** 2;
const isWhite = (x, y) => (inCircle(x, y, outer) && !inCircle(x, y, inner)) || inPolygon(x, y, starPoints);

function png(size) {
  const ss = 4; // supersampling for smooth edges
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let px = 0; px < size; px++) {
      let hits = 0;
      for (let sy = 0; sy < ss; sy++)
        for (let sx = 0; sx < ss; sx++) if (isWhite((px + (sx + 0.5) / ss) / size, (py + (sy + 0.5) / ss) / size)) hits++;
      const t = hits / (ss * ss);
      for (let c = 0; c < 3; c++) row[1 + px * 3 + c] = Math.round(RED[c] * (1 - t) + WHITE[c] * t);
    }
    rows.push(row);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = new URL('../icons/', import.meta.url);
mkdirSync(dir, { recursive: true });
for (const size of [180, 192, 512]) writeFileSync(new URL(`icon-${size}.png`, dir), png(size));

const p = (v) => (v * 100).toFixed(2);
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" rx="22" fill="#E30A17"/>` +
  `<circle cx="${p(outer.x)}" cy="${p(outer.y)}" r="${p(outer.r)}" fill="#fff"/>` +
  `<circle cx="${p(inner.x)}" cy="${p(inner.y)}" r="${p(inner.r)}" fill="#E30A17"/>` +
  `<polygon points="${starPoints.map(([x, y]) => `${p(x)},${p(y)}`).join(' ')}" fill="#fff"/></svg>\n`;
writeFileSync(new URL('icon.svg', dir), svg);
console.log('Icons written to icons/');
