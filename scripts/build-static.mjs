// Copies the public site files into dist/ so static hosts (Vercel, Netlify,
// etc.) get a clean output directory that contains only what the site needs.
// Runs after `tsc` as part of `npm run build`.
import { cpSync, copyFileSync, mkdirSync, rmSync } from "node:fs";

const OUT = "dist";
const files = ["index.html", "templates.html", "contact.html", "favicon.svg"];
const dirs = ["css", "examples", "js"];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const file of files) copyFileSync(file, `${OUT}/${file}`);
for (const dir of dirs) cpSync(dir, `${OUT}/${dir}`, { recursive: true });

console.log(`Built ${OUT}/: ${files.length} files + ${dirs.length} directories`);
