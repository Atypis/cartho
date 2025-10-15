#!/usr/bin/env node

/**
 * React Flow Documentation Scraper (Comprehensive)
 *
 * Fetches ALL pages from React Flow documentation, not just top-level pages.
 *
 * Usage: node scripts/scrape-react-flow-docs.js
 */

import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  fence: '```',
});

// Comprehensive list of ALL React Flow doc pages
const PAGES = [
  // Learn - Quick Start
  { url: 'https://reactflow.dev/learn', filename: 'learn/01-quick-start.md', title: 'Quick Start' },

  // Learn - Core Concepts
  { url: 'https://reactflow.dev/learn/concepts/terms-and-definitions', filename: 'learn/concepts/01-terms-and-definitions.md', title: 'Terms and Definitions' },
  { url: 'https://reactflow.dev/learn/concepts/building-a-flow', filename: 'learn/concepts/02-building-a-flow.md', title: 'Building a Flow' },
  { url: 'https://reactflow.dev/learn/concepts/adding-interactivity', filename: 'learn/concepts/03-adding-interactivity.md', title: 'Adding Interactivity' },
  { url: 'https://reactflow.dev/learn/concepts/the-viewport', filename: 'learn/concepts/04-the-viewport.md', title: 'The Viewport' },
  { url: 'https://reactflow.dev/learn/concepts/built-in-components', filename: 'learn/concepts/05-built-in-components.md', title: 'Built-In Components' },

  // Learn - Customization
  { url: 'https://reactflow.dev/learn/customization/custom-nodes', filename: 'learn/customization/01-custom-nodes.md', title: 'Custom Nodes' },
  { url: 'https://reactflow.dev/learn/customization/handles', filename: 'learn/customization/02-handles.md', title: 'Handles' },
  { url: 'https://reactflow.dev/learn/customization/custom-edges', filename: 'learn/customization/03-custom-edges.md', title: 'Custom Edges' },
  { url: 'https://reactflow.dev/learn/customization/edge-labels', filename: 'learn/customization/04-edge-labels.md', title: 'Edge Labels' },
  { url: 'https://reactflow.dev/learn/customization/utility-classes', filename: 'learn/customization/05-utility-classes.md', title: 'Utility Classes' },
  { url: 'https://reactflow.dev/learn/customization/theming', filename: 'learn/customization/06-theming.md', title: 'Theming' },

  // Learn - Layouting
  { url: 'https://reactflow.dev/learn/layouting/layouting', filename: 'learn/layouting/01-layouting.md', title: 'Layouting Overview' },
  { url: 'https://reactflow.dev/learn/layouting/sub-flows', filename: 'learn/layouting/02-sub-flows.md', title: 'Sub Flows' },

  // Learn - Advanced Use
  { url: 'https://reactflow.dev/learn/advanced-use/hooks-providers', filename: 'learn/advanced/01-hooks-providers.md', title: 'Hooks and Providers' },
  { url: 'https://reactflow.dev/learn/advanced-use/accessibility', filename: 'learn/advanced/02-accessibility.md', title: 'Accessibility' },
  { url: 'https://reactflow.dev/learn/advanced-use/testing', filename: 'learn/advanced/03-testing.md', title: 'Testing' },
  { url: 'https://reactflow.dev/learn/advanced-use/typescript', filename: 'learn/advanced/04-typescript.md', title: 'TypeScript' },
  { url: 'https://reactflow.dev/learn/advanced-use/uncontrolled-flow', filename: 'learn/advanced/05-uncontrolled-flow.md', title: 'Uncontrolled Flow' },
  { url: 'https://reactflow.dev/learn/advanced-use/performance', filename: 'learn/advanced/06-performance.md', title: 'Performance' },
  { url: 'https://reactflow.dev/learn/advanced-use/state-management', filename: 'learn/advanced/07-state-management.md', title: 'State Management' },
  { url: 'https://reactflow.dev/learn/advanced-use/computing-flows', filename: 'learn/advanced/08-computing-flows.md', title: 'Computing Flows' },
  { url: 'https://reactflow.dev/learn/advanced-use/ssr-ssg-configuration', filename: 'learn/advanced/09-ssr-ssg.md', title: 'Server Side Rendering' },
  { url: 'https://reactflow.dev/learn/advanced-use/devtools-and-debugging', filename: 'learn/advanced/10-devtools.md', title: 'Devtools and Debugging' },
  { url: 'https://reactflow.dev/learn/advanced-use/whiteboard', filename: 'learn/advanced/11-whiteboard.md', title: 'Whiteboard Features' },

  // API Reference - Main Component
  { url: 'https://reactflow.dev/api-reference/react-flow', filename: 'api-reference/react-flow-component.md', title: 'ReactFlow Component' },

  // API Reference - Components
  { url: 'https://reactflow.dev/api-reference/components/background', filename: 'api-reference/components/background.md', title: 'Background' },
  { url: 'https://reactflow.dev/api-reference/components/controls', filename: 'api-reference/components/controls.md', title: 'Controls' },
  { url: 'https://reactflow.dev/api-reference/components/minimap', filename: 'api-reference/components/minimap.md', title: 'MiniMap' },
  { url: 'https://reactflow.dev/api-reference/components/panel', filename: 'api-reference/components/panel.md', title: 'Panel' },
  { url: 'https://reactflow.dev/api-reference/components/handle', filename: 'api-reference/components/handle.md', title: 'Handle' },
  { url: 'https://reactflow.dev/api-reference/components/node-toolbar', filename: 'api-reference/components/node-toolbar.md', title: 'NodeToolbar' },
  { url: 'https://reactflow.dev/api-reference/components/node-resizer', filename: 'api-reference/components/node-resizer.md', title: 'NodeResizer' },
  { url: 'https://reactflow.dev/api-reference/components/base-edge', filename: 'api-reference/components/base-edge.md', title: 'BaseEdge' },

  // API Reference - Hooks
  { url: 'https://reactflow.dev/api-reference/hooks/use-react-flow', filename: 'api-reference/hooks/use-react-flow.md', title: 'useReactFlow' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-nodes', filename: 'api-reference/hooks/use-nodes.md', title: 'useNodes' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-edges', filename: 'api-reference/hooks/use-edges.md', title: 'useEdges' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-nodes-state', filename: 'api-reference/hooks/use-nodes-state.md', title: 'useNodesState' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-edges-state', filename: 'api-reference/hooks/use-edges-state.md', title: 'useEdgesState' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-viewport', filename: 'api-reference/hooks/use-viewport.md', title: 'useViewport' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-connection', filename: 'api-reference/hooks/use-connection.md', title: 'useConnection' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-handle-connections', filename: 'api-reference/hooks/use-handle-connections.md', title: 'useHandleConnections' },
  { url: 'https://reactflow.dev/api-reference/hooks/use-store', filename: 'api-reference/hooks/use-store.md', title: 'useStore' },

  // API Reference - Types
  { url: 'https://reactflow.dev/api-reference/types/node', filename: 'api-reference/types/node.md', title: 'Node Type' },
  { url: 'https://reactflow.dev/api-reference/types/edge', filename: 'api-reference/types/edge.md', title: 'Edge Type' },
  { url: 'https://reactflow.dev/api-reference/types/node-props', filename: 'api-reference/types/node-props.md', title: 'NodeProps' },
  { url: 'https://reactflow.dev/api-reference/types/edge-props', filename: 'api-reference/types/edge-props.md', title: 'EdgeProps' },
  { url: 'https://reactflow.dev/api-reference/types/connection', filename: 'api-reference/types/connection.md', title: 'Connection Type' },
  { url: 'https://reactflow.dev/api-reference/types/viewport', filename: 'api-reference/types/viewport.md', title: 'Viewport Type' },

  // API Reference - Utils
  { url: 'https://reactflow.dev/api-reference/utils/get-connected-edges', filename: 'api-reference/utils/get-connected-edges.md', title: 'getConnectedEdges' },
  { url: 'https://reactflow.dev/api-reference/utils/add-edge', filename: 'api-reference/utils/add-edge.md', title: 'addEdge' },
  { url: 'https://reactflow.dev/api-reference/utils/get-outgoers', filename: 'api-reference/utils/get-outgoers.md', title: 'getOutgoers' },
  { url: 'https://reactflow.dev/api-reference/utils/get-incomers', filename: 'api-reference/utils/get-incomers.md', title: 'getIncomers' },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'react-flow');

async function fetchHTML(url) {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.text();
}

function extractMainContent(html, url) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const selectors = ['main article', 'main', 'article', '.docs-content', '[role="main"]'];

  let mainContent = null;
  for (const selector of selectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }

  if (!mainContent) {
    throw new Error(`Could not find main content for ${url}`);
  }

  const removeSelectors = ['nav', 'header', 'footer', '.navigation', '.sidebar', '.table-of-contents', '[aria-label="Breadcrumb"]'];
  removeSelectors.forEach(selector => {
    mainContent.querySelectorAll(selector).forEach(el => el.remove());
  });

  return mainContent.innerHTML;
}

function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}

function saveMarkdown(content, filename, url, title) {
  const filePath = path.join(OUTPUT_DIR, filename);
  const fileDir = path.dirname(filePath);

  // Create directory if needed
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  const header = `# ${title}

**Source:** ${url}
**Scraped:** ${new Date().toISOString()}

---

`;

  const fullContent = header + content;
  fs.writeFileSync(filePath, fullContent, 'utf-8');
  console.log(`✓ Saved: ${filename} (${(fullContent.length / 1024).toFixed(1)} KB)`);
}

async function scrapeReactFlowDocs() {
  console.log('React Flow Documentation Scraper (Comprehensive)\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (const page of PAGES) {
    try {
      const html = await fetchHTML(page.url);
      const mainContent = extractMainContent(html, page.url);
      const markdown = htmlToMarkdown(mainContent);
      saveMarkdown(markdown, page.filename, page.url, page.title);
      successCount++;

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`✗ Failed: ${page.url} - ${error.message}`);
      failCount++;
    }
  }

  createIndexFile();

  console.log(`\n✓ Complete: ${successCount} succeeded, ${failCount} failed`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

function createIndexFile() {
  const indexContent = `# React Flow Documentation

**Last updated:** ${new Date().toISOString()}
**Source:** https://reactflow.dev

## Learn Section

### Quick Start
- [Quick Start](learn/01-quick-start.md)

### Core Concepts
- [Terms and Definitions](learn/concepts/01-terms-and-definitions.md)
- [Building a Flow](learn/concepts/02-building-a-flow.md)
- [Adding Interactivity](learn/concepts/03-adding-interactivity.md)
- [The Viewport](learn/concepts/04-the-viewport.md)
- [Built-In Components](learn/concepts/05-built-in-components.md)

### Customization
- [Custom Nodes](learn/customization/01-custom-nodes.md)
- [Handles](learn/customization/02-handles.md)
- [Custom Edges](learn/customization/03-custom-edges.md)
- [Edge Labels](learn/customization/04-edge-labels.md)
- [Utility Classes](learn/customization/05-utility-classes.md)
- [Theming](learn/customization/06-theming.md)

### Layouting
- [Layouting Overview](learn/layouting/01-layouting.md)
- [Sub Flows](learn/layouting/02-sub-flows.md)

### Advanced Use
- [Hooks and Providers](learn/advanced/01-hooks-providers.md)
- [Accessibility](learn/advanced/02-accessibility.md)
- [Testing](learn/advanced/03-testing.md)
- [TypeScript](learn/advanced/04-typescript.md)
- [Uncontrolled Flow](learn/advanced/05-uncontrolled-flow.md)
- [Performance](learn/advanced/06-performance.md)
- [State Management](learn/advanced/07-state-management.md)
- [Computing Flows](learn/advanced/08-computing-flows.md)
- [Server Side Rendering](learn/advanced/09-ssr-ssg.md)
- [Devtools and Debugging](learn/advanced/10-devtools.md)
- [Whiteboard Features](learn/advanced/11-whiteboard.md)

## API Reference

### Components
- [ReactFlow Component](api-reference/react-flow-component.md)
- [Background](api-reference/components/background.md)
- [Controls](api-reference/components/controls.md)
- [MiniMap](api-reference/components/minimap.md)
- [Panel](api-reference/components/panel.md)
- [Handle](api-reference/components/handle.md)
- [NodeToolbar](api-reference/components/node-toolbar.md)
- [NodeResizer](api-reference/components/node-resizer.md)
- [BaseEdge](api-reference/components/base-edge.md)

### Hooks
- [useReactFlow](api-reference/hooks/use-react-flow.md)
- [useNodes](api-reference/hooks/use-nodes.md)
- [useEdges](api-reference/hooks/use-edges.md)
- [useNodesState](api-reference/hooks/use-nodes-state.md)
- [useEdgesState](api-reference/hooks/use-edges-state.md)
- [useViewport](api-reference/hooks/use-viewport.md)
- [useConnection](api-reference/hooks/use-connection.md)
- [useHandleConnections](api-reference/hooks/use-handle-connections.md)
- [useStore](api-reference/hooks/use-store.md)

### Types
- [Node](api-reference/types/node.md)
- [Edge](api-reference/types/edge.md)
- [NodeProps](api-reference/types/node-props.md)
- [EdgeProps](api-reference/types/edge-props.md)
- [Connection](api-reference/types/connection.md)
- [Viewport](api-reference/types/viewport.md)

### Utils
- [getConnectedEdges](api-reference/utils/get-connected-edges.md)
- [addEdge](api-reference/utils/add-edge.md)
- [getOutgoers](api-reference/utils/get-outgoers.md)
- [getIncomers](api-reference/utils/get-incomers.md)

---

To update: \`npm run scrape:react-flow\`
`;

  const indexPath = path.join(OUTPUT_DIR, 'README.md');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log('✓ Created README index');
}

scrapeReactFlowDocs().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
