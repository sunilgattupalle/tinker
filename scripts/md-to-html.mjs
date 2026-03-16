#!/usr/bin/env node
/**
 * Converts markdown files to readable HTML with a minimal template.
 * Usage: node scripts/md-to-html.mjs <file.md> [file2.md ...]
 * Output: docs/generated/<path>.html (docs/*.md → docs/generated/*.html; specs/*.md → docs/generated/specs/*.html).
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { marked } from 'marked'

const CSS = `
  body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.6; max-width: 52rem; margin: 0 auto; padding: 2rem; color: #1a1a1a; }
  h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
  h1 { font-size: 1.75rem; border-bottom: 1px solid #e2e0dc; padding-bottom: 0.25em; }
  h2 { font-size: 1.35rem; }
  h3 { font-size: 1.15rem; }
  p { margin: 0.75em 0; }
  ul, ol { margin: 0.75em 0; padding-left: 1.5em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e2e0dc; padding: 0.5em 0.75em; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  pre { background: #f9f7f3; border: 1px solid #e2e0dc; border-radius: 6px; padding: 1em; overflow-x: auto; font-size: 0.9em; }
  code { font-family: ui-monospace, monospace; font-size: 0.9em; background: #f5f5f5; padding: 0.15em 0.4em; border-radius: 4px; }
  pre code { background: none; padding: 0; }
  a { color: #4c6ef5; }
  hr { border: none; border-top: 1px solid #e2e0dc; margin: 1.5em 0; }
`

function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Document'
}

function mdToHtml(mdPath) {
  const fullPath = join(process.cwd(), mdPath)
  let md
  try {
    md = readFileSync(fullPath, 'utf-8')
  } catch (err) {
    console.error(`Could not read ${mdPath}:`, err.message)
    return false
  }

  const title = extractTitle(md)
  const body = marked.parse(md, { async: false })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${CSS}</style>
</head>
<body>
${body}
</body>
</html>
`

  const base = mdPath.replace(/\.md$/i, '.html')
  const outRelative = base.startsWith('docs/') ? base.slice(5) : base // docs/foo.md → foo.html; specs/foo.md → specs/foo.html
  const outPath = join(process.cwd(), 'docs', 'generated', outRelative)
  try {
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html, 'utf-8')
    console.log(outPath)
    return outRelative
  } catch (err) {
    console.error(`Could not write ${outPath}:`, err.message)
    return null
  }
}

function writeIndexHtml(generatedPaths) {
  const links = generatedPaths
    .filter(Boolean)
    .sort()
    .map((rel) => {
      const href = rel.replace(/\.html$/, '.html')
      const label = href.replace(/\.html$/, '').replace(/^specs\//, 'specs/').replace(/\//g, ' / ')
      return `    <li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
    })
    .join('\n')
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tinker — Docs</title>
  <style>${CSS}</style>
</head>
<body>
  <h1>Tinker — Docs</h1>
  <p>Generated from markdown. Pick a doc to read:</p>
  <ul>
${links}
  </ul>
</body>
</html>
`
  const indexPath = join(process.cwd(), 'docs', 'generated', 'index.html')
  writeFileSync(indexPath, html, 'utf-8')
  console.log(indexPath)
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/md-to-html.mjs <file.md> [file2.md ...]')
  process.exit(1)
}

let failed = 0
const generatedPaths = []
for (const path of args) {
  if (!path.endsWith('.md')) {
    console.error(`Skipping non-.md file: ${path}`)
    failed++
    continue
  }
  const outRelative = mdToHtml(path)
  if (outRelative) generatedPaths.push(outRelative)
  else failed++
}
if (generatedPaths.length > 0) writeIndexHtml(generatedPaths)

process.exit(failed > 0 ? 1 : 0)
