import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const master = await readFile(path.join(root, "public/icons/macify-mark.svg"), "utf8");
const mark = master.match(/<path[\s\S]*?\/>/)[0];
const whiteMark = mark.replace('fill="#101217"', 'fill="#fff"');
const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>\n`;
const tile = (rounded = true, scale = 0.8) => wrap(
  `<rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="#1457ff"/>`
  + `<g transform="translate(${32 * (1 - scale)} ${32 * (1 - scale)}) scale(${scale})">${whiteMark}</g>`,
);
const save = (name, content) => writeFile(path.join(root, name), content);
const png = (svg, size) => sharp(Buffer.from(svg), { density: Math.max(72, size * 72 / 64) }).resize(size, size).png().toBuffer();

await save("public/icons/macify-mark-light.svg", wrap(whiteMark));
await save("public/icons/macify-app.svg", tile());
await save("src/app/icon.svg", tile());
await save("src/app/apple-icon.png", await png(tile(false), 180));
for (const size of [192, 512, 1080]) {
  await save(`public/icons/macify-${size}.png`, await png(tile(), size));
}
await save("public/icons/macify-maskable-512.png", await png(tile(false, 0.76), 512));

// An ICO directory can contain PNG-compressed images at each browser size.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((size) => png(tile(), size)));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await save("src/app/favicon.ico", Buffer.concat([directory, ...frames]));
process.stdout.write("Generated Open window SVG, favicon, touch, app, and maskable icons.\n");
