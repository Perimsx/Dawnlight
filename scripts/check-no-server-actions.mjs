import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'server', 'config', 'content', 'types']
const SCAN_FILES = ['nuxt.config.ts']
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.vue', '.json', '.md'])
const SKIP_DIRS = new Set(['node_modules', '.git', '.nuxt', '.output', 'dist', 'coverage'])

const PATTERNS = [
  { name: 'use server directive', regex: /(^|\n)\s*['"]use server['"]\s*;?/gi },
  { name: 'serverActions option', regex: /\bserverActions?\b/gi },
  { name: 'server action marker', regex: /\bserver[-_\s]?action\b/gi },
  { name: 'server action id marker', regex: /\bserver[-_\s]?action[-_\s]?id\b/gi }
]

async function walk(dir) {
  const result = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      result.push(...await walk(full))
      continue
    }
    const ext = path.extname(entry.name).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) continue
    result.push(full)
  }
  return result
}

function collectLines(text, regex) {
  const lines = new Set()
  let match
  while ((match = regex.exec(text)) !== null) {
    const index = match.index
    const line = text.slice(0, index).split('\n').length
    lines.add(line)
  }
  regex.lastIndex = 0
  return [...lines].sort((a, b) => a - b)
}

async function fileExists(filePath) {
  try {
    const s = await stat(filePath)
    return s.isFile()
  } catch {
    return false
  }
}

async function main() {
  const files = []
  for (const dir of SCAN_DIRS) {
    const full = path.join(ROOT, dir)
    try {
      const s = await stat(full)
      if (!s.isDirectory()) continue
      files.push(...await walk(full))
    } catch {
      // ignore missing directories
    }
  }

  for (const file of SCAN_FILES) {
    const full = path.join(ROOT, file)
    if (await fileExists(full)) files.push(full)
  }

  const violations = []
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    for (const rule of PATTERNS) {
      const lines = collectLines(text, rule.regex)
      if (lines.length > 0) {
        violations.push({
          file: path.relative(ROOT, file).replaceAll('\\', '/'),
          rule: rule.name,
          lines
        })
      }
    }
  }

  if (violations.length > 0) {
    console.error('[guard] detected forbidden Server Action patterns:')
    for (const v of violations) {
      console.error(` - ${v.file} (${v.rule}) lines: ${v.lines.join(', ')}`)
    }
    process.exit(1)
  }

  console.log('[guard] no Server Action pattern found')
}

main().catch((error) => {
  console.error('[guard] check failed:', error)
  process.exit(1)
})
