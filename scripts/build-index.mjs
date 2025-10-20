#!/usr/bin/env node
/**
 * Build PN-INDEX.json by scanning prescriptive-norms and shared-primitives.
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const CARTO = path.join(ROOT, 'eu-ai-act-cartography');
const PN_DIR = path.join(CARTO, 'prescriptive-norms');
const SP_DIR = path.join(PN_DIR, 'shared-primitives');
const INDEX_PATH = path.join(PN_DIR, 'PN-INDEX.json');

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

function scan(dir, filter) {
  return fs.readdirSync(dir)
    .filter((f) => filter(f))
    .map((f) => path.join(dir, f));
}

function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

function isJsonFile(name) { return name.endsWith('.json'); }

function collectPNs() {
  const files = scan(PN_DIR, (f) => isJsonFile(f) && f !== 'PN-INDEX.json');
  const pns = [];
  for (const fp of files) {
    const obj = readJSON(fp);
    if (!obj || !obj.id) continue;
    pns.push({
      id: obj.id,
      title: obj.title || '',
      path: rel(fp),
      shared_refs: Array.isArray(obj.shared_refs) ? obj.shared_refs : [],
      status: obj.metadata?.status || 'draft',
    });
  }
  // Stable sort by id
  pns.sort((a, b) => a.id.localeCompare(b.id));
  return pns;
}

function collectSPs() {
  const files = scan(SP_DIR, isJsonFile).filter((p) => !p.includes('/schema/'));
  const sps = [];
  for (const fp of files) {
    const obj = readJSON(fp);
    if (!obj || !obj.id) continue;
    sps.push({ id: obj.id, path: rel(fp), status: obj.metadata?.status || 'draft' });
  }
  sps.sort((a, b) => a.id.localeCompare(b.id));
  return sps;
}

async function main() {
  const index = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    schema_version: '2025-10-10',
    prescriptive_norms: collectPNs(),
    shared_primitives: collectSPs(),
  };
  await fsp.writeFile(INDEX_PATH, JSON.stringify(index, null, 2) + '\n');
  console.log(`✅ Wrote ${rel(INDEX_PATH)}`);
}

main().catch((e) => {
  console.error('build-index failed:', e);
  process.exit(1);
});

