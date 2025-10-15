#!/usr/bin/env node

/**
 * AI SDK Documentation Splitter
 *
 * Splits the monolithic llms.txt file into organized sections and files
 * based on the heading structure.
 *
 * Usage: node scripts/split-ai-sdk-docs.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '..', 'docs', 'ai-sdk', 'ai-sdk-complete.md');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'ai-sdk');

/**
 * Sanitize filename - remove special characters, lowercase, replace spaces with hyphens
 */
function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Determine folder and filename based on heading hierarchy and content
 */
function getFilePathForSection(heading, parentSection, sectionIndex) {
  const sanitized = sanitizeFilename(heading);

  // Major sections mapping
  const sectionMap = {
    'guides': 'guides',
    'cookbook': 'cookbook',
    'ai sdk': 'core',
    'agents': 'agents',
    'ai sdk core': 'core',
    'ai sdk ui': 'ui',
    'ai sdk rsc': 'rsc',
    'advanced': 'advanced',
    'reference': 'reference',
    'foundations': 'foundations',
    'getting started': 'getting-started',
  };

  // Check if this is a major section
  const headingLower = heading.toLowerCase();
  for (const [key, folder] of Object.entries(sectionMap)) {
    if (headingLower === key || headingLower.startsWith(key + ' ')) {
      return { folder, filename: '00-overview.md', isMajorSection: true };
    }
  }

  // If we have a parent section context, use it
  if (parentSection) {
    const folder = sectionMap[parentSection.toLowerCase()] || 'misc';
    const filename = `${String(sectionIndex).padStart(2, '0')}-${sanitized}.md`;
    return { folder, filename, isMajorSection: false };
  }

  // Default: misc folder
  return { folder: 'misc', filename: `${sanitized}.md`, isMajorSection: false };
}

/**
 * Parse the complete markdown file and split into sections
 */
function parseAndSplit() {
  console.log('AI SDK Documentation Splitter\n');
  console.log(`Reading: ${INPUT_FILE}`);

  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');

  let currentSection = null;
  let currentContent = [];
  let sectionCounter = {};
  let fileCount = 0;
  let parentSection = null;

  const sections = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect top-level heading (# Heading)
    if (line.match(/^# [A-Z]/)) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n'),
          parentSection,
        });
      }

      // Start new section
      currentSection = line.replace(/^# /, '').trim();
      currentContent = [line];

      // Check if this is a major section that should become parent
      const majorSections = ['guides', 'agents', 'ai sdk core', 'ai sdk ui', 'ai sdk rsc', 'advanced', 'reference', 'foundations', 'getting started'];
      const sectionLower = currentSection.toLowerCase();
      if (majorSections.some(major => sectionLower === major || sectionLower.startsWith(major + ' '))) {
        parentSection = currentSection;
      }
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n'),
      parentSection,
    });
  }

  console.log(`\nFound ${sections.length} sections\n`);

  // Write sections to files
  for (const section of sections) {
    // Initialize counter for this parent section if needed
    if (!sectionCounter[section.parentSection || 'misc']) {
      sectionCounter[section.parentSection || 'misc'] = 1;
    }

    const { folder, filename, isMajorSection } = getFilePathForSection(
      section.title,
      section.parentSection,
      sectionCounter[section.parentSection || 'misc']
    );

    if (!isMajorSection) {
      sectionCounter[section.parentSection || 'misc']++;
    }

    const folderPath = path.join(OUTPUT_DIR, folder);
    const filePath = path.join(folderPath, filename);

    // Create folder if needed
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Add metadata header
    const header = `# ${section.title}

**Source:** https://ai-sdk.dev/
**Section:** ${folder}
**Split from:** ai-sdk-complete.md

---

`;

    const fullContent = header + section.content;

    fs.writeFileSync(filePath, fullContent, 'utf-8');
    console.log(`✓ ${folder}/${filename} (${(fullContent.length / 1024).toFixed(1)} KB)`);
    fileCount++;
  }

  console.log(`\n✓ Created ${fileCount} files`);
  createIndex(sections);
}

/**
 * Create a comprehensive index/README
 */
function createIndex(sections) {
  // Group sections by folder
  const grouped = {};

  for (const section of sections) {
    const { folder } = getFilePathForSection(section.title, section.parentSection, 0);
    if (!grouped[folder]) {
      grouped[folder] = [];
    }
    grouped[folder].push(section.title);
  }

  let indexContent = `# AI SDK v5 Documentation (Organized)

**Source:** https://ai-sdk.dev/
**Last updated:** ${new Date().toISOString()}

This directory contains the complete AI SDK v5 documentation split into organized files.

## Directory Structure

`;

  const folderDescriptions = {
    'guides': 'Step-by-step guides for common use cases',
    'cookbook': 'Code examples and recipes',
    'foundations': 'Core concepts and fundamentals',
    'getting-started': 'Framework-specific getting started guides',
    'agents': 'Building AI agents',
    'core': 'AI SDK Core - text generation, tools, embeddings',
    'ui': 'AI SDK UI - React hooks and components',
    'rsc': 'AI SDK RSC - React Server Components (experimental)',
    'advanced': 'Advanced topics and patterns',
    'reference': 'Complete API reference documentation',
    'misc': 'Additional documentation',
  };

  for (const [folder, titles] of Object.entries(grouped).sort()) {
    const description = folderDescriptions[folder] || '';
    indexContent += `\n### ${folder}/\n`;
    if (description) {
      indexContent += `*${description}*\n\n`;
    }
    indexContent += `${titles.length} files\n`;
  }

  indexContent += `\n## Complete Documentation

For the complete, unsplit documentation in a single file:
- [ai-sdk-complete.md](ai-sdk-complete.md) (1.1 MB)

## Quick Links

### Most Relevant for Your Project

**AI SDK UI (Chat Interface)**
- [ui/00-overview.md](ui/00-overview.md)
- Look for: useChat, useCompletion, tool calling

**AI SDK Core (LLM Integration)**
- [core/00-overview.md](core/00-overview.md)
- Look for: generateText, streamText, tool usage

**Streaming & Tools**
- [foundations/](foundations/)
- Look for: streaming patterns, tool definitions

## Updating

To re-download and re-split the documentation:

\`\`\`bash
# Download latest
curl -o docs/ai-sdk/ai-sdk-complete.md https://ai-sdk.dev/llms.txt

# Split into files
node scripts/split-ai-sdk-docs.js
\`\`\`
`;

  const indexPath = path.join(OUTPUT_DIR, 'README-split.md');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log('✓ Created README-split.md index');
}

// Run the splitter
try {
  parseAndSplit();
  console.log(`\n📁 Output: ${OUTPUT_DIR}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
