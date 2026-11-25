import fs from 'node:fs/promises';
import sharp from 'sharp';

const files = {
  'cuerdas-onda': 'SlinkyCobalt.JPG',
  'microfono-claro': 'Behringer C-1.jpg',
  'monitor-alfar': 'PreSonus Eris E4.5 HD Active Studio Monitor - 2014 NAMM Show (by Matt Vanacoro).jpg',
  'parlante-brisa': 'Behringer Eurolive B212D Loudspeaker.jpg',
  'controlador-eco': 'Numark Mixtrack.jpg',
  'audifonos-senda': 'Audio Technica ATH-M50 Headphones.jpg',
  'interfaz-faro': 'M-Audio - Fast Track Pro.jpg'
};

for (const [id, filename] of Object.entries(files)) {
  if (process.argv[2] && process.argv[2] !== id) continue;
  const api = new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action', 'query');
  api.searchParams.set('titles', `File:${filename}`);
  api.searchParams.set('prop', 'imageinfo');
  api.searchParams.set('iiprop', 'url');
  api.searchParams.set('iiurlwidth', '1200');
  api.searchParams.set('format', 'json');
  const headers = { 'User-Agent': 'DigariStudioAcademic/1.0 (photo attribution in docs/fuentes-imagenes.md)' };
  const catalog = await fetch(api, { headers });
  if (!catalog.ok) throw new Error(`${id} metadata HTTP ${catalog.status}`);
  const page = Object.values((await catalog.json()).query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`${id} no aparece en Commons`);
  let photo;
  for (const url of [info.thumburl, info.url].filter(Boolean)) {
    const response = await fetch(url, { headers });
    if (response.ok) { photo = Buffer.from(await response.arrayBuffer()); break; }
    console.log(`${id} descarga HTTP ${response.status}, buscando siguiente resolución`);
  }
  if (!photo) throw new Error(`${id} no pudo descargarse`);
  const output = `public/product-photos/${id}.webp`;
  await sharp(photo).rotate().resize(1120, 750, { fit: 'contain', background: '#eee8dc', withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(output);
  console.log(`${id} ${output} ${(await fs.stat(output)).size} bytes`);
}
