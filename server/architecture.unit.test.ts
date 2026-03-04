/**
 * Architecture unit tests — validates project-wide conventions.
 * This file is intentionally at the server root and self-excluded from the co-location rule.
 */
import { describe, expect, test } from 'bun:test'
import { globSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

const SERVER_DIR = join(import.meta.dir)
const DOMAIN_DIR = join(SERVER_DIR, 'domain')

const domains = readdirSync(DOMAIN_DIR).filter((d) => statSync(join(DOMAIN_DIR, d)).isDirectory())

const readFile = (path: string) => readFileSync(path, 'utf-8')

const glob = (pattern: string) => globSync(pattern, { cwd: join(SERVER_DIR, '..') })

describe('architecture', () => {
  describe('each domain has a types.ts', () => {
    domains.forEach((domain) => {
      test(domain, () => {
        const typesPath = join(DOMAIN_DIR, domain, 'types.ts')
        expect(statSync(typesPath).isFile()).toBe(true)
      })
    })
  })

  describe('primitives.ts imports ts-brand and zod', () => {
    const primitivesFiles = glob('server/domain/*/primitives.ts')

    const ownPrimitives = primitivesFiles.filter((f) => {
      const content = readFile(join(SERVER_DIR, '..', f))
      return !content.split('\n').every((l) => l.trim() === '' || l.startsWith('export '))
    })

    ownPrimitives.forEach((file) => {
      const fullPath = join(SERVER_DIR, '..', file)
      const domain = file.split('/')[2]

      test(domain, () => {
        const content = readFile(fullPath)
        expect(content).toContain('ts-brand')
        expect(content).toContain('zod')
      })
    })
  })

  describe('no console.log/error/warn in server code', () => {
    const serverFiles = glob('server/**/*.ts').filter(
      (f) => !f.includes('test/') && !f.endsWith('.test.ts'),
    )

    test('no console statements found', () => {
      const violations = serverFiles.flatMap((file) => {
        const content = readFile(join(SERVER_DIR, '..', file))
        return content
          .split('\n')
          .map((line, i) => ({ line, num: i + 1 }))
          .filter(({ line }) => /console\.(log|error|warn)/.test(line))
          .map(({ line, num }) => `${file}:${num}: ${line.trim()}`)
      })
      expect(violations).toEqual([])
    })
  })

  describe('no cross-domain repository imports', () => {
    const domainFiles = glob('server/domain/**/*.ts').filter((f) => !f.endsWith('.test.ts'))

    // exchange/sandbox.ts is an adapter that bridges exchange ↔ trading by design
    const allowed: Record<string, string[]> = {
      exchange: ['trading'],
    }

    test('production code does not import repository from another domain', () => {
      const violations = domainFiles.flatMap((file) => {
        const currentDomain = file.split('/')[2]
        const content = readFile(join(SERVER_DIR, '..', file))
        return content
          .split('\n')
          .map((line, i) => ({ line, num: i + 1 }))
          .filter(({ line }) => {
            const match = line.match(/from\s+['"]~\/domain\/(\w+)\/repository['"]/)
            return (
              match && match[1] !== currentDomain && !allowed[currentDomain]?.includes(match[1])
            )
          })
          .map(({ line, num }) => {
            const match = line.match(/from\s+['"]~\/domain\/(\w+)\/repository['"]/)
            return `${file}:${num}: imports ${match?.[1]}/repository`
          })
      })
      expect(violations).toEqual([])
    })
  })

  describe('tests are co-located with source files', () => {
    const testFiles = glob('server/**/*.test.ts').filter(
      (f) => f !== 'server/architecture.unit.test.ts',
    )
    const validSuffixes = ['.unit.test.ts', '.int.test.ts', '.func.test.ts']

    test('each test file uses a valid suffix', () => {
      const violations = testFiles.filter(
        (f) => !validSuffixes.some((suffix) => f.endsWith(suffix)),
      )
      expect(violations).toEqual([])
    })

    test('each test file is in the same directory as a source file', () => {
      const violations = testFiles.filter((testFile) => {
        const dir = dirname(join(SERVER_DIR, '..', testFile))
        const sourceFiles = readdirSync(dir).filter(
          (f) => f.endsWith('.ts') && !f.endsWith('.test.ts'),
        )
        return sourceFiles.length === 0
      })
      expect(violations).toEqual([])
    })
  })

  describe('no throw in domain query.ts and command.ts', () => {
    const targets = glob('server/domain/*/{query,command}.ts')

    targets.forEach((file) => {
      test(`${basename(dirname(file))}/${basename(file)}`, () => {
        const content = readFile(join(SERVER_DIR, '..', file))
        const violations = content
          .split('\n')
          .map((line, i) => ({ line, num: i + 1 }))
          .filter(({ line }) => /throw\s+new\s+Error/.test(line))
          .map(({ line, num }) => `${file}:${num}: ${line.trim()}`)
        expect(violations).toEqual([])
      })
    })
  })
})
