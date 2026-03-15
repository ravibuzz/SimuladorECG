import fs from 'fs';

const content = fs.readFileSync('src/constants.ts', 'utf8');
const rhythmsMatch = content.match(/export const RHYTHMS: Record<string, RhythmDef> = \{([\s\S]*?)\n\};/);
const infoMatch = content.match(/export const INFO_CONTENT: Record<string, \{ title: string; desc: string; points: string\[\] \}> = \{([\s\S]*?)\n\};/);

const rKeys = [...rhythmsMatch[1].matchAll(/([a-zA-Z0-9_]+): \{/g)].map(m => m[1]);
const iKeys = [...infoMatch[1].matchAll(/([a-zA-Z0-9_]+): \{/g)].map(m => m[1]);

const missing = rKeys.filter(k => !iKeys.includes(k));
console.log('Missing in INFO_CONTENT:', missing);
