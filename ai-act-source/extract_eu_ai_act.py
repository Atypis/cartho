#!/usr/bin/env python3
"""
Extract EU AI Act content from HTML and convert to clean Markdown format.
"""

from bs4 import BeautifulSoup
import re
import sys


def clean_text(text):
    """Clean and normalize text."""
    if not text:
        return ""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_table_as_list(table):
    """Extract table content as a formatted list."""
    rows = []
    for tr in table.find_all('tr', recursive=True):
        cells = tr.find_all('td')
        if len(cells) == 2:
            label = clean_text(cells[0].get_text())
            content = clean_text(cells[1].get_text())
            if label and content:
                rows.append((label, content))
        elif len(cells) == 3:
            # 3-column table: often empty first column, number, content
            label = clean_text(cells[1].get_text())
            content = clean_text(cells[2].get_text())
            if label and content:
                rows.append((label, content))
    return rows


def process_element(element, output, indent_level=0):
    """Recursively process elements and build markdown."""

    # Skip text nodes
    if not hasattr(element, 'name') or element.name is None:
        return

    # Skip certain elements
    if element.name in ['script', 'style', 'head', 'meta', 'link', 'img']:
        return

    # Get element class
    elem_class = ' '.join(element.get('class', []))

    # Document title
    if 'oj-doc-ti' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n# {text}\n")
        return

    # Chapter headers (CHAPTER I, CHAPTER II, etc.)
    if 'oj-ti-section-1' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n## {text}\n")
        return

    # Section headers (sub-headers under chapters)
    if 'oj-ti-section-2' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n### {text}\n")
        return

    # Article headers
    if 'oj-ti-art' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n### {text}\n")
        return

    # Article sub-titles
    if 'oj-sti-art' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n**{text}**\n")
        return

    # Annex section headers (Section A, Section B, etc.)
    if 'oj-ti-grseq-1' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n### {text}\n")
        return

    # Tables (for numbered lists, recitals, etc.)
    if element.name == 'table':
        rows = extract_table_as_list(element)
        for label, content in rows:
            # Check if it's a numbered/lettered list item
            if re.match(r'^[\(\[]*[a-z0-9]+[\)\]\.]*$', label, re.IGNORECASE):
                output.append(f"\n{label} {content}\n")
            else:
                output.append(f"\n**{label}** {content}\n")
        return

    # Signatures
    if 'oj-signatory' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n{text}\n")
        return

    # Footnotes/references
    if 'oj-note' in elem_class:
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n{text}\n")
        return

    # Normal paragraphs (but not if they're inside a table we'll process separately)
    if 'oj-normal' in elem_class and not element.find_parent('table'):
        text = clean_text(element.get_text())
        if text:
            output.append(f"\n{text}\n")
        return

    # Recursively process children
    if hasattr(element, 'children'):
        for child in element.children:
            if hasattr(child, 'name'):
                process_element(child, output, indent_level)


def extract_markdown(html_content):
    """Extract and convert HTML to markdown."""
    soup = BeautifulSoup(html_content, 'html.parser')
    output = []

    # Find all eli-container divs (main regulation + annexes)
    containers = soup.find_all('div', class_='eli-container')
    if not containers:
        print("Warning: Could not find eli-container, processing entire body")
        containers = [soup.find('body')]

    for container in containers:
        if container:
            process_element(container, output)

    # Join and clean up
    markdown = ''.join(output)
    # Remove excessive newlines (more than 2)
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    return markdown.strip()


def main():
    input_file = 'OJ%3AL_202401689%3AEN%3ATXT.html'
    output_file = 'EU_AI_Act.md'

    print(f"Reading {input_file}...")

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        sys.exit(1)

    print("Parsing HTML...")
    markdown = extract_markdown(html_content)

    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)

    # Get some stats
    lines = markdown.count('\n')
    chars = len(markdown)
    articles = len(re.findall(r'^### Article \d+', markdown, re.MULTILINE))
    chapters = len(re.findall(r'^## CHAPTER', markdown, re.MULTILINE))

    print(f"✓ Successfully extracted:")
    print(f"  - {chars:,} characters")
    print(f"  - {lines:,} lines")
    print(f"  - {chapters} chapters")
    print(f"  - {articles} articles")


if __name__ == '__main__':
    main()
