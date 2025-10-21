#!/usr/bin/env node
/**
 * Validate group metadata consistency
 *
 * Checks:
 * - All group.members reference existing PNs
 * - All PNs with group_id are in group.members
 * - No duplicate group_order within groups
 * - No orphan group_ids
 * - All shared_gates refs exist in shared-primitives
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CARTO = path.join(ROOT, 'eu-ai-act-cartography');
const PN_DIR = path.join(CARTO, 'prescriptive-norms');
const SP_DIR = path.join(PN_DIR, 'shared-primitives');
const GROUPS_PATH = path.join(PN_DIR, 'groups.json');

function readJSON(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch { return null; }
}

function loadGroups() {
  const data = readJSON(GROUPS_PATH);
  if (!data || !Array.isArray(data.groups)) {
    console.error('❌ groups.json not found or invalid');
    process.exit(1);
  }
  return data.groups;
}

function loadPNs() {
  const files = fs.readdirSync(PN_DIR)
    .filter(f => f.endsWith('.json') && f !== 'PN-INDEX.json' && f !== 'groups.json')
    .map(f => path.join(PN_DIR, f));

  const pns = [];
  for (const fp of files) {
    const obj = readJSON(fp);
    if (obj && obj.id) {
      pns.push({
        id: obj.id,
        group_id: obj.group_id,
        group_order: obj.group_order,
        path: fp
      });
    }
  }
  return pns;
}

function loadSPs() {
  const files = fs.readdirSync(SP_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('/schema/'))
    .map(f => path.join(SP_DIR, f));

  const sps = [];
  for (const fp of files) {
    const obj = readJSON(fp);
    if (obj && obj.id) {
      sps.push(obj.id);
    }
  }
  return sps;
}

function validate() {
  const groups = loadGroups();
  const pns = loadPNs();
  const sps = loadSPs();

  const pnIds = new Set(pns.map(p => p.id));
  const spIds = new Set(sps);
  const errors = [];
  const warnings = [];

  console.log(`🔍 Validating ${groups.length} groups...`);

  for (const group of groups) {
    console.log(`\n📦 Group: ${group.id}`);

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

    // Check for missing group_order
    const missingOrder = pnsInGroup.filter(p => p.group_order === undefined);
    if (missingOrder.length > 0) {
      warnings.push(`Group "${group.id}": ${missingOrder.length} member(s) missing group_order: ${missingOrder.map(p => p.id).join(', ')}`);
    }

    // Check shared_gates refs exist in shared-primitives
    for (const gate of group.shared_gates) {
      const gateRef = gate.replace('!', ''); // Remove negation prefix
      if (!spIds.has(gateRef)) {
        warnings.push(`Group "${group.id}": shared_gate "${gateRef}" not found in shared-primitives`);
      }
    }

    console.log(`   ✓ ${group.members.length} members`);
    console.log(`   ✓ ${group.shared_gates.length} shared gates`);
  }

  // Check orphan group_ids
  const groupIds = new Set(groups.map(g => g.id));
  for (const pn of pns) {
    if (pn.group_id && !groupIds.has(pn.group_id)) {
      errors.push(`PN "${pn.id}" references non-existent group "${pn.group_id}"`);
    }
  }

  // Report results
  console.log('\n' + '='.repeat(60));

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s):`);
    warnings.forEach(w => console.log(`   - ${w}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s):`);
    errors.forEach(e => console.log(`   - ${e}`));
    process.exit(1);
  }

  console.log('\n✅ All validation checks passed!');
  console.log(`   - ${groups.length} groups`);
  console.log(`   - ${pns.filter(p => p.group_id).length} grouped PNs`);
  console.log(`   - ${sps.length} shared primitives`);
}

validate();
