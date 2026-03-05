import { describe, expect, test } from 'bun:test'
import { MigrationName, MigrationVersion } from '~/system/migration/primitives'
import { runMigrations } from '~/system/migration/runner'
import type { Migration, MigrationMeta } from '~/system/migration/types'

const makeMigration = (version: number, outcome: 'ok' | 'error' = 'ok'): Migration => ({
  version: MigrationVersion(version),
  name: MigrationName(`Migration ${version}`),
  migrate: async () =>
    outcome === 'ok'
      ? { outcome: 'ok', transformed: version }
      : { outcome: 'error', reason: `Failed at ${version}` },
})

describe('runMigrations', () => {
  test('runs pending migrations in order', async () => {
    const migrations = [makeMigration(2), makeMigration(1)]
    const results = await runMigrations(migrations)

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ outcome: 'ok', transformed: 1 })
    expect(results[1]).toEqual({ outcome: 'ok', transformed: 2 })
  })

  test('skips already-applied migrations', async () => {
    const migrations = [makeMigration(1), makeMigration(2)]

    await runMigrations([makeMigration(1)])
    const results = await runMigrations(migrations)

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ outcome: 'ok', transformed: 2 })
  })

  test('stops on first error and returns partial results', async () => {
    const migrations = [makeMigration(1), makeMigration(2, 'error'), makeMigration(3)]
    const results = await runMigrations(migrations)

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ outcome: 'ok', transformed: 1 })
    expect(results[1]).toEqual({ outcome: 'error', reason: 'Failed at 2' })
  })

  test('updates migration meta after each success', async () => {
    await runMigrations([makeMigration(1), makeMigration(2)])

    const meta = await useStorage('migration-meta').getItem<MigrationMeta>('meta')
    expect(meta).not.toBeNull()
    expect(meta?.currentVersion).toBe(MigrationVersion(2))
  })

  test('returns empty array when no pending migrations', async () => {
    const results = await runMigrations([])
    expect(results).toEqual([])
  })
})
