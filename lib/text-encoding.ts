const cp1252Special = new Map<number, number>([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

function cp1252Byte(character: string): number | undefined {
  const codePoint = character.codePointAt(0)!;
  if (codePoint <= 0x7f || (codePoint >= 0xa0 && codePoint <= 0xff) || (codePoint >= 0x80 && codePoint <= 0x9f)) return codePoint;
  return cp1252Special.get(codePoint);
}

function decodeUtf8Bytes(bytes: number[]): string | undefined {
  const first = bytes[0];
  let codePoint: number;
  if (bytes.length === 2) codePoint = ((first & 0x1f) << 6) | (bytes[1] & 0x3f);
  else if (bytes.length === 3) codePoint = ((first & 0x0f) << 12) | ((bytes[1] & 0x3f) << 6) | (bytes[2] & 0x3f);
  else codePoint = ((first & 0x07) << 18) | ((bytes[1] & 0x3f) << 12) | ((bytes[2] & 0x3f) << 6) | (bytes[3] & 0x3f);
  if ((bytes.length === 2 && codePoint < 0x80) || (bytes.length === 3 && codePoint < 0x800) || (bytes.length === 4 && (codePoint < 0x10000 || codePoint > 0x10ffff))) return undefined;
  if (codePoint >= 0xd800 && codePoint <= 0xdfff) return undefined;
  return String.fromCodePoint(codePoint);
}

/** Repairs legacy UTF-8 text that was decoded as Windows-1252 before storage. */
export function repairLegacyUtf8(value: string): string {
  let current = value;
  for (let pass = 0; pass < 2; pass++) {
    let output = '';
    for (let index = 0; index < current.length;) {
      const points = [...current.slice(index)];
      const first = cp1252Byte(points[0]);
      const length = first === undefined ? 0 : first >= 0xc2 && first <= 0xdf ? 2 : first >= 0xe0 && first <= 0xef ? 3 : first >= 0xf0 && first <= 0xf4 ? 4 : 0;
      let decoded: string | undefined;
      if (length && points.length >= length) {
        const bytes = points.slice(0, length).map(cp1252Byte);
        if (bytes.every((byte): byte is number => byte !== undefined) && bytes.slice(1).every((byte) => byte >= 0x80 && byte <= 0xbf)) {
          const second = bytes[1];
          const validRange = (first !== 0xe0 || second >= 0xa0) && (first !== 0xed || second < 0xa0) && (first !== 0xf0 || second >= 0x90) && (first !== 0xf4 || second <= 0x8f);
          if (validRange) decoded = decodeUtf8Bytes(bytes);
        }
      }
      if (decoded) { output += decoded; index += length; }
      else { const character = String.fromCodePoint(current.codePointAt(index)!); output += character; index += character.length; }
    }
    if (output === current) break;
    current = output;
  }
  return current;
}
