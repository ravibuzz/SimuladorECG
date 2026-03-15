const fs = require('fs');

const content = fs.readFileSync('src/constants.ts', 'utf8');
const rKeys = [];
const iKeys = [];

let inRhythms = false;
let inInfo = false;

for (const line of content.split('\n')) {
    if (line.includes('export const RHYTHMS')) inRhythms = true;
    else if (line.includes('export const INFO_CONTENT')) {
        inRhythms = false;
        inInfo = true;
    } else if (line.includes('export const GUIDELINES')) {
        inInfo = false;
    }

    const match = line.match(/^  ([a-zA-Z0-9_]+): \{/);
    if (match) {
        if (inRhythms) rKeys.push(match[1]);
        if (inInfo) iKeys.push(match[1]);
    }
}

const missing = rKeys.filter(k => !iKeys.includes(k));
console.log('Missing in INFO_CONTENT:', missing);
