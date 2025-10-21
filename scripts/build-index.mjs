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
  const files = scan(PN_DIR, (f) => isJsonFile(f) && f !== 'PN-INDEX.json' && f !== 'groups.json');
  const pns = [];
  for (const fp of files) {
    const obj = readJSON(fp);
    if (!obj || !obj.id) continue;
    const pn = {
      id: obj.id,
      title: obj.title || '',
      path: rel(fp),
      shared_refs: Array.isArray(obj.shared_refs) ? obj.shared_refs : [],
      status: obj.metadata?.status || 'draft',
    };
    // Preserve group metadata if present
    if (obj.group_id) pn.group_id = obj.group_id;
    if (obj.group_order !== undefined) pn.group_order = obj.group_order;
    pns.push(pn);
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

function loadGroups() {
  const groupsPath = path.join(PN_DIR, 'groups.json');
  const groupsData = readJSON(groupsPath);
  return groupsData?.groups || [];
}

function validateGroups(groups, pns) {
  const pnIds = new Set(pns.map(p => p.id));
  const errors = [];

  for (const group of groups) {
    // Check all members exist
    for (const memberId of group.members) {
      if (!pnIds.has(memberId)) {
        errors.push(`Group "${group.id}": member "${memberId}" not found in PNs`);
      }
    }

    // Check all PNs with this group_id are in members list
    const memberSet = new Set(group.members);
    const pnsInGroup = pns.filter(p => p.group_id === group.id);
    for (const pn of pnsInGroup) {
      if (!memberSet.has(pn.id)) {
        errors.push(`PN "${pn.id}" has group_id="${group.id}" but is not in group.members`);
      }
    }

    // Check for duplicate group_order
    const orders = pnsInGroup.map(p => p.group_order).filter(o => o !== undefined);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push(`Group "${group.id}": duplicate group_order values found`);
    }
  }

  // Check orphan group_ids
  const groupIds = new Set(groups.map(g => g.id));
  for (const pn of pns) {
    if (pn.group_id && !groupIds.has(pn.group_id)) {
      errors.push(`PN "${pn.id}" references non-existent group "${pn.group_id}"`);
    }
  }

  return errors;
}

async function main() {
  const pns = collectPNs();
  const sps = collectSPs();
  const groups = loadGroups();

  // Validate groups
  const errors = validateGroups(groups, pns);
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  const index = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    schema_version: '2025-10-10',
    groups,
    prescriptive_norms: pns,
    shared_primitives: sps,
  };

  await fsp.writeFile(INDEX_PATH, JSON.stringify(index, null, 2) + '\n');
  console.log(`✅ Wrote ${rel(INDEX_PATH)}`);
  console.log(`   - ${groups.length} groups`);
  console.log(`   - ${pns.length} prescriptive norms (${pns.filter(p => p.group_id).length} grouped)`);
  console.log(`   - ${sps.length} shared primitives`);
}

main().catch((e) => {
  console.error('build-index failed:', e);
  process.exit(1);
});

