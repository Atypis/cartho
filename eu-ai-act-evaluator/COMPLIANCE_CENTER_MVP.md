# Compliance Center MVP - Implementation Guide

## What's Been Built

The Phase 1 MVP for the Compliance Center is now complete! Here's what's included:

### Backend Components

1. **Database Schema** (`supabase/migrations/001_compliance_center_tables.sql`)
   - `obligation_instances` - Core table tracking PN × Use Case combinations
   - `obligation_status_history` - Audit trail for state changes

2. **Type Definitions** (`lib/supabase/types.ts`)
   - Full TypeScript types for new tables
   - Strongly-typed applicability and implementation states

3. **API Routes**
   - `POST /api/evaluate` - Extended to create/update obligation instances automatically
   - `GET /api/obligations` - Fetch obligations with filtering
   - `GET /api/obligations/stats` - Aggregate compliance statistics
   - `GET /api/obligations/:id` - Single obligation detail with history
   - `GET /api/obligations/find` - Find obligation by use_case_id + pn_id

### Frontend Components

4. **Shared UI Components** (`components/compliance/shared/`)
   - `StatusBadge` - Displays applicability/implementation status
   - `RiskBadge` - Risk level indicator
   - `DueDateBadge` - Due date with urgency colors

5. **Pages**
   - **Compliance Overview** (`/compliance-center`)
     - Executive dashboard with KPIs
     - Applicability breakdown
     - Compliance breakdown
     - Risk distribution
     - Needs attention alerts

   - **Obligations Registry** (`/compliance-center/obligations`)
     - Filterable list of all obligations
     - Search by PN ID, title, or use case
     - Filter by applicability, implementation, risk
     - Card-based layout with badges

   - **Obligation Detail** (`/compliance-center/obligations/[id]`)
     - Full obligation details
     - Evaluation tab with RequirementsGrid
     - History tab with audit trail
     - Placeholders for Phase 2/3 tabs (Controls, Evidence, Tasks)

6. **Navigation**
   - AppSidebar updated with Compliance Center section
   - Two navigation items: Compliance Center and Obligations

---

## How It Works

### Automatic Obligation Creation

When an evaluation completes, the system automatically:
1. Checks if an obligation instance exists for (use_case_id, pn_id)
2. Creates new or updates existing obligation instance
3. Sets `applicability_state` based on root decision
4. Sets `implementation_state` to `not_started` if applicable
5. Logs state change to history table

**Location:** `app/api/evaluate/route.ts:268-275` (calls `handleObligationInstanceUpdate`)

### Data Flow

```
Evaluation → Obligation Instance → Compliance Center Views
```

1. User runs evaluation in Use Case Cockpit
2. Evaluation engine processes requirements tree
3. Root decision calculated (applies/not_applicable)
4. Obligation instance created/updated
5. Immediately visible in Compliance Center

---

## Next Steps

### To Deploy

1. **Run Database Migration**
   ```bash
   # Connect to your Supabase project
   # Run the SQL in supabase/migrations/001_compliance_center_tables.sql
   ```

2. **Backfill Existing Data** (optional but recommended)
   ```bash
   # Create and run the backfill script (see BACKFILL section below)
   npm run backfill-obligations
   ```

3. **Test the Flow**
   - Create a use case
   - Run an evaluation
   - Navigate to Compliance Center
   - Verify obligation appears

### Integration Points (Optional)

#### Add Direct Links from Use Case Cockpit

In `components/usecase/GroupCard.tsx` or `UseCaseCockpit.tsx`, add buttons like:

```tsx
import { ExternalLink } from 'lucide-react';

// In PN status display:
<button
  onClick={async () => {
    const res = await fetch(
      `/api/obligations/find?use_case_id=${useCaseId}&pn_id=${pnId}`
    );
    const { found, id } = await res.json();
    if (found) {
      router.push(`/compliance-center/obligations/${id}`);
    }
  }}
  className="text-xs text-blue-600 hover:underline flex items-center"
>
  <ExternalLink className="w-3 h-3 mr-1" />
  View Compliance Status
</button>
```

---

## BACKFILL Script

To create obligation instances from existing evaluations, create:

**`scripts/backfill-obligations.ts`**

```typescript
import { supabase } from '../lib/supabase/client';
import { reconstructEvaluation } from '../lib/evaluation/reconstruct';

async function backfillObligations() {
  console.log('🔄 Starting obligation backfill...');

  // Get all completed evaluations
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('*')
    .eq('status', 'completed');

  if (!evaluations) {
    console.log('No evaluations found');
    return;
  }

  console.log(`Found ${evaluations.length} evaluations to process`);

  for (const evaluation of evaluations) {
    for (const pnId of evaluation.pn_ids) {
      console.log(`Processing ${pnId} for evaluation ${evaluation.id}`);

      // Load PN data
      const bundleRes = await fetch(
        `http://localhost:3000/api/prescriptive/bundle?pnIds=${pnId}`
      );
      const bundle = await bundleRes.json();
      const pn = bundle.pns[0];

      // Load evaluation results
      const { data: results } = await supabase
        .from('evaluation_results')
        .select('*')
        .eq('evaluation_id', evaluation.id);

      // Reconstruct
      const reconstructed = reconstructEvaluation(
        pn,
        bundle.sharedPrimitives,
        results || []
      );

      const rootDecision = reconstructed.rootDecision;
      if (rootDecision === null) continue;

      // Check if obligation exists
      const { data: existing } = await supabase
        .from('obligation_instances')
        .select('id')
        .eq('use_case_id', evaluation.use_case_id)
        .eq('pn_id', pnId)
        .single();

      if (existing) {
        console.log(`  ⏭️  Already exists, skipping`);
        continue;
      }

      // Create obligation
      const { error } = await supabase.from('obligation_instances').insert({
        use_case_id: evaluation.use_case_id,
        pn_id: pnId,
        pn_title: pn.title,
        pn_article: pn.article_refs?.[0]?.article?.toString(),
        applicability_state: rootDecision ? 'applies' : 'not_applicable',
        latest_evaluation_id: evaluation.id,
        root_decision: rootDecision,
        evaluated_at: evaluation.completed_at,
        implementation_state: rootDecision ? 'not_started' : null,
      });

      if (error) {
        console.error(`  ❌ Error creating obligation:`, error);
      } else {
        console.log(`  ✅ Created obligation for ${pnId}`);
      }
    }
  }

  console.log('✅ Backfill complete!');
}

backfillObligations();
```

Add to `package.json`:

```json
{
  "scripts": {
    "backfill-obligations": "tsx scripts/backfill-obligations.ts"
  }
}
```

---

## Phase 2 Preview (Controls & Ownership)

The next phase will add:
- Controls library (master catalog of compliance controls)
- Control status tracking per obligation
- Owner assignment
- Due date management
- Implementation state workflow

Tables to add:
- `compliance_controls`
- `obligation_control_status`

---

## Phase 3 Preview (Evidence & Tasks)

Following phases will add:
- Evidence upload and review workflow
- Task tracking
- Jira/GitHub integration
- Exceptions/waivers

Tables to add:
- `evidence`
- `tasks`
- `exceptions`

---

## Support

For questions or issues:
1. Check type definitions in `lib/supabase/types.ts`
2. Review API routes in `app/api/obligations/`
3. Inspect migration SQL for schema details

**The MVP is ready to use!** Navigate to `/compliance-center` to see it in action.
