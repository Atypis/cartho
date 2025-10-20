#!/usr/bin/env node
/**
 * Prescriptive Norms Validator
 * - JSON Schema validation (PN + shared primitives)
 * - Deep lint: ids, root, child refs, cycles, operator constraints, reachability
 * - Ref integrity: PN.shared_refs matches used refs, and refs exist in shared primitives
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const CARTO_ROOT = path.join(process.cwd(), 'eu-ai-act-cartography');
const PN_DIR = path.join(CARTO_ROOT, 'prescriptive-norms');
const PN_SCHEMA_PATH = path.join(PN_DIR, 'schema', 'prescriptive-norm.schema.json');
const SP_DIR = path.join(PN_DIR, 'shared-primitives');
const SP_SCHEMA_PATH = path.join(SP_DIR, 'schema', 'shared-primitive.schema.json');

function readJSONSync(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function listFiles(dir, filter = (f) => true) {
  return fs
    .readdirSync(dir)
    .filter((f) => filter(f))
    .map((f) => path.join(dir, f));
}

function buildNodeMap(nodes) {
  const map = new Map();
  for (const n of nodes) {
    if (map.has(n.id)) throw new Error(`Duplicate node id: ${n.id}`);
    map.set(n.id, n);
  }
  return map;
}

function checkChildrenExist(node, map, errors) {
  if (node.kind === 'composite') {
    if (!node.operator) errors.push(`Composite ${node.id} missing operator`);
    if (!node.children || node.children.length === 0) errors.push(`Composite ${node.id} has no children`);
    if (node.operator === 'not' && node.children && node.children.length !== 1) {
      errors.push(`NOT operator must have exactly 1 child at ${node.id}`);
    }
    if (node.operator === 'xor' && node.children && node.children.length < 2) {
      errors.push(`XOR operator must have >= 2 children at ${node.id}`);
    }
    (node.children || []).forEach((cid) => {
      if (!map.has(cid)) errors.push(`Child not found: ${cid} (parent ${node.id})`);
    });
  }
}

function detectCycles(rootId, nodes, map) {
  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(id) {
    if (stack.has(id)) {
      cycles.push([...stack, id].join(' -> '));
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    const n = map.get(id);
    if (n && n.kind === 'composite' && n.children) {
      n.children.forEach(dfs);
    }
    stack.delete(id);
  }

  dfs(rootId);
  return { cycles, visited };
}

function getAllPrimitiveRefs(nodes) {
  const refs = new Set();
  for (const n of nodes) {
    if (n.kind === 'primitive' && n.ref) refs.add(n.ref);
  }
  return refs;
}

function loadSharedPrimitiveIds() {
  const files = listFiles(SP_DIR, (f) => f.endsWith('.json') && f !== 'registry.json')
    .filter((p) => !p.includes('/schema/'));
  const ids = new Set();
  for (const fp of files) {
    try {
      const obj = readJSONSync(fp);
      if (obj && obj.id) ids.add(obj.id);
    } catch (e) {
      // ignore parse errors here; schema phase will catch
    }
  }
  return ids;
}

async function main() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const pnSchema = readJSONSync(PN_SCHEMA_PATH);
  const spSchema = readJSONSync(SP_SCHEMA_PATH);
  const validatePN = ajv.compile(pnSchema);
  const validateSP = ajv.compile(spSchema);

  let errorCount = 0;
  let warnCount = 0;

  // Validate shared primitives first
  const spFiles = listFiles(SP_DIR, (f) => f.endsWith('.json'))
    .filter((p) => !p.includes('/schema/'))
    .filter((p) => !p.endsWith('/registry.json'));
  console.log(`🔎 Validating shared primitives (${spFiles.length})`);
  for (const fp of spFiles) {
    try {
      const obj = readJSONSync(fp);
      const ok = validateSP(obj);
      if (!ok) {
        errorCount++;
        console.error(`❌ [SP] ${path.relative(process.cwd(), fp)}:`, validateSP.errors);
        continue;
      }
      const nodes = obj.logic.nodes || [];
      const map = buildNodeMap(nodes);
      const rootId = obj.logic.root;
      if (!map.has(rootId)) {
        errorCount++;
        console.error(`❌ [SP] Root not found: ${rootId} (${fp})`);
        continue;
      }
      const errors = [] as string[];
      nodes.forEach((n) => checkChildrenExist(n, map, errors));
      if (errors.length) {
        errorCount += errors.length;
        console.error(`❌ [SP] Structural errors in ${fp}:\n - ${errors.join('\n - ')}`);
      }
      const { cycles, visited } = detectCycles(rootId, nodes, map);
      if (cycles.length) {
        errorCount += cycles.length;
        console.error(`❌ [SP] Cycles detected in ${fp}:\n - ${cycles.join('\n - ')}`);
      }
      const unreachable = nodes.filter((n) => !visited.has(n.id));
      if (unreachable.length) {
        warnCount += unreachable.length;
        console.warn(`⚠️  [SP] Unreachable nodes in ${fp}: ${unreachable.map((n) => n.id).join(', ')}`);
      }
    } catch (e) {
      errorCount++;
      console.error(`❌ [SP] Failed to validate ${fp}:`, e.message);
    }
  }

  // Build set of shared primitive ids to check PN refs
  const sharedIds = loadSharedPrimitiveIds();

  // Validate PNs
  const pnFiles = listFiles(PN_DIR, (f) => f.endsWith('.json'))
    .filter((p) => !p.includes('/schema/'))
    .filter((p) => !p.endsWith('/PN-INDEX.json'))
    .filter((p) => !p.includes('/examples/'));

  console.log(`\n🔎 Validating prescriptive norms (${pnFiles.length})`);
  for (const fp of pnFiles) {
    try {
      const pn = readJSONSync(fp);
      const ok = validatePN(pn);
      if (!ok) {
        errorCount++;
        console.error(`❌ [PN] ${path.relative(process.cwd(), fp)}:`, validatePN.errors);
        continue;
      }
      const nodes = pn.requirements.nodes || [];
      const map = buildNodeMap(nodes);
      const rootId = pn.requirements.root;
      if (!map.has(rootId)) {
        errorCount++;
        console.error(`❌ [PN] Root not found: ${rootId} (${fp})`);
        continue;
      }
      const errors = [] as string[];
      nodes.forEach((n) => checkChildrenExist(n, map, errors));
      if (errors.length) {
        errorCount += errors.length;
        console.error(`❌ [PN] Structural errors in ${fp}:\n - ${errors.join('\n - ')}`);
      }
      const { cycles, visited } = detectCycles(rootId, nodes, map);
      if (cycles.length) {
        errorCount += cycles.length;
        console.error(`❌ [PN] Cycles detected in ${fp}:\n - ${cycles.join('\n - ')}`);
      }
      const unreachable = nodes.filter((n) => !visited.has(n.id));
      if (unreachable.length) {
        warnCount += unreachable.length;
        console.warn(`⚠️  [PN] Unreachable nodes in ${fp}: ${unreachable.map((n) => n.id).join(', ')}`);
      }
      // Ref integrity
      const usedRefs = getAllPrimitiveRefs(nodes);
      for (const ref of usedRefs) {
        if (!sharedIds.has(ref)) {
          errorCount++;
          console.error(`❌ [PN] Unknown shared ref ${ref} in ${fp}`);
        }
      }
      const declared = new Set(pn.shared_refs || []);
      const missingInDeclared = [...usedRefs].filter((r) => !declared.has(r));
      const unusedInDeclared = [...declared].filter((r) => !usedRefs.has(r));
      if (missingInDeclared.length) {
        errorCount += missingInDeclared.length;
        console.error(`❌ [PN] shared_refs missing for: ${missingInDeclared.join(', ')} (${fp})`);
      }
      if (unusedInDeclared.length) {
        warnCount += unusedInDeclared.length;
        console.warn(`⚠️  [PN] shared_refs includes unused ids: ${unusedInDeclared.join(', ')} (${fp})`);
      }
      // Article refs presence
      if (!pn.article_refs || pn.article_refs.length === 0) {
        warnCount++;
        console.warn(`⚠️  [PN] Missing article_refs: ${fp}`);
      }
      // Effective date recommended
      if (!pn.side_info || !pn.side_info.effective_from) {
        warnCount++;
        console.warn(`⚠️  [PN] Missing side_info.effective_from: ${fp}`);
      }
    } catch (e) {
      errorCount++;
      console.error(`❌ [PN] Failed to validate ${fp}:`, e.message);
    }
  }

  console.log(`\n✅ Validation complete. Errors: ${errorCount}, Warnings: ${warnCount}`);
  if (errorCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Validator crashed:', e);
  process.exit(1);
});

