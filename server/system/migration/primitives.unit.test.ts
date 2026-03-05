import { describe, expect, test } from 'bun:test'
import { MigrationName, MigrationVersion } from '~/system/migration/primitives'

describe('MigrationVersion', () => {
  test('accepts zero', () => {
    expect(MigrationVersion(0)).toBe(MigrationVersion(0))
  })

  test('accepts a positive integer', () => {
    expect(MigrationVersion(3)).toBe(MigrationVersion(3))
  })

  test('rejects a negative number', () => {
    expect(() => MigrationVersion(-1)).toThrow()
  })

  test('rejects a float', () => {
    expect(() => MigrationVersion(1.5)).toThrow()
  })
})

describe('MigrationName', () => {
  test('accepts a non-empty string', () => {
    expect(MigrationName('Initial migration')).toBe(MigrationName('Initial migration'))
  })

  test('rejects an empty string', () => {
    expect(() => MigrationName('')).toThrow()
  })
})
