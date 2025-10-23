/**
 * Backfill Obligations Script
 *
 * Creates obligation instances from existing completed evaluations
 * Run with: npx tsx scripts/backfill-obligations.ts
 */

import { supabase } from '../lib/supabase/client';
import { reconstructEvaluation } from '../lib/evaluation/reconstruct';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

async function backfillObligations() {
  console.log('🔄 Starting obligation backfill...\n');

  // Get all completed evaluations
  console.log('📂 Fetching completed evaluations...');
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (evalError) {
    console.error('❌ Error fetching evaluations:', evalError);
    return;
  }

  if (!evaluations || evaluations.length === 0) {
    console.log('✅ No completed evaluations found. Nothing to backfill.');
    return;
  }

  console.log(`✅ Found ${evaluations.length} completed evaluations\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < evaluations.length; i++) {
    const evaluation = evaluations[i];
    console.log(`[${i + 1}/${evaluations.length}] Processing evaluation ${evaluation.id}`);
    console.log(`   Use Case: ${evaluation.use_case_id}`);
    console.log(`   PNs: ${evaluation.pn_ids.join(', ')}`);

    for (const pnId of evaluation.pn_ids) {
      try {
        // Check if obligation already exists
        const { data: existing } = await supabase
          .from('obligation_instances')
          .select('id')
          .eq('use_case_id', evaluation.use_case_id)
          .eq('pn_id', pnId)
          .single();

        if (existing) {
          console.log(`   ⏭️  ${pnId}: Already exists (${existing.id}), skipping`);
          skipped++;
          continue;
        }

        // Load PN bundle
        const bundleRes = await fetch(
          `${API_BASE_URL}/api/prescriptive/bundle?pnIds=${encodeURIComponent(pnId)}`
        );

        if (!bundleRes.ok) {
          console.error(`   ❌ ${pnId}: Failed to load PN bundle`);
          errors++;
          continue;
        }

        const bundle = await bundleRes.json();
        const pn = bundle.pns?.[0];

        if (!pn) {
          console.error(`   ❌ ${pnId}: PN not found in bundle`);
          errors++;
          continue;
        }

        // Load evaluation results
        const { data: results } = await supabase
          .from('evaluation_results')
          .select('*')
          .eq('evaluation_id', evaluation.id);

        // Reconstruct evaluation to get root decision
        const reconstructed = reconstructEvaluation(
          pn,
          bundle.sharedPrimitives || [],
          results || []
        );

        const rootDecision = reconstructed.rootDecision;

        if (rootDecision === null) {
          console.log(`   ⚠️  ${pnId}: No root decision (incomplete evaluation), skipping`);
          skipped++;
          continue;
        }

        const applicabilityState = rootDecision ? 'applies' : 'not_applicable';

        // Create obligation instance
        const { data: newObligation, error: insertError } = await supabase
          .from('obligation_instances')
          .insert({
            use_case_id: evaluation.use_case_id,
            pn_id: pnId,
            pn_title: pn.title || null,
            pn_article: pn.article_refs?.[0]?.article?.toString() || null,
            applicability_state: applicabilityState,
            latest_evaluation_id: evaluation.id,
            root_decision: rootDecision,
            evaluated_at: evaluation.completed_at || evaluation.triggered_at,
            implementation_state: rootDecision ? 'not_started' : null,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ ${pnId}: Error creating obligation:`, insertError.message);
          errors++;
          continue;
        }

        // Log to history
        if (newObligation) {
          await supabase.from('obligation_status_history').insert({
            obligation_instance_id: newObligation.id,
            from_state: null,
            to_state: applicabilityState,
            kind: 'applicability',
            changed_at: evaluation.completed_at || evaluation.triggered_at,
          });

          console.log(`   ✅ ${pnId}: Created obligation ${newObligation.id} (${applicabilityState})`);
          created++;
        }
      } catch (error) {
        console.error(`   ❌ ${pnId}: Unexpected error:`, error);
        errors++;
      }
    }

    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('━'.repeat(60));
  console.log('📊 Backfill Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped (already exist): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total processed: ${created + skipped + errors}`);
  console.log('━'.repeat(60));
  console.log('\n✅ Backfill complete!\n');
}

// Run the backfill
backfillObligations()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
