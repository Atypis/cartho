# Claude Code Configuration

## MCP Servers

### Configuration Location
- **Config file**: `/Users/a1984/.claude.json`
- **Backup file**: `/Users/a1984/cartho/.mcp-backup.json`

### Previously Installed MCP Servers (Currently Removed)

1. **browser-automation**
   - Type: stdio
   - Command: `node /Users/a1984/subsidy4u/browser-automation-mcp/dist/index.js`
   - Status: **REMOVED** (backed up)

2. **supabase**
   - Type: stdio
   - Command: `npx -y @supabase/mcp-server-supabase@latest`
   - Has access token: `sbp_0553026b23011b1ad9c6829e92114343a30963c8`
   - Status: **REMOVED** (backed up)

### Current Status
Both MCP servers have been **completely removed** from the config to eliminate ~30k token usage.

Configuration backed up to: `/Users/a1984/cartho/.mcp-backup.json`

### How to Re-enable
To restore the MCP servers:
1. Open `/Users/a1984/cartho/.mcp-backup.json`
2. Copy the entire `mcpServers` object
3. Paste it into `/Users/a1984/.claude.json` (look for `"mcpServers": {}` around line 1992)
4. Restart Claude Code

### How to Temporarily Disable (Alternative)
Instead of deleting, you can disable servers temporarily:
```json
"disabledMcpjsonServers": ["browser-automation", "supabase"]
```

### Token Management
- Default MCP output limit: 25,000 tokens
- Can be adjusted with `MAX_MCP_OUTPUT_TOKENS` setting
- Recommended value for reduced usage: 5000-10000 tokens

## Supabase Project

### Active Project for EU AI Act Evaluator
- **Project Name**: Cartho
- **Project ID**: `oejdvywncxhnhquytwnh`
- **Region**: eu-central-1
- **Status**: ACTIVE_HEALTHY

When using Supabase MCP tools (migrations, queries, etc.), always use this project ID.
