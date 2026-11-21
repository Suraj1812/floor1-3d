import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const shell = await readFile(path.join(root, 'src/page-shell.html'), 'utf8');
const markup = await readFile(path.join(root, 'src/room-markup.html'), 'utf8');
if (!shell.includes('<!-- ROOM_MARKUP -->')) throw new Error('Room mount is missing.');
await writeFile(path.join(output, 'index.html'), shell.replace('<!-- ROOM_MARKUP -->', markup));
for (const file of ['app.js', 'floor-extension.js', 'state.js', 'site.css', 'room.css']) {
  await cp(path.join(root, 'src', file), path.join(output, file));
}
for (const directory of ['assets', 'vendor']) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}
console.log('Built Floor 1 into dist/');
