import type { Brand } from 'ts-brand'
import type { Timestamp } from '~/domain/shared/types'

export type MigrationVersion = Brand<number, 'MigrationVersion'>
export type MigrationName = Brand<string, 'MigrationName'>

export type MigrationContext = {
  storage: (name: string) => ReturnType<typeof useStorage>
}

export type Migration = {
  version: MigrationVersion
  name: MigrationName
  migrate: (ctx: MigrationContext) => Promise<MigrationResult>
}

export type MigrationResult =
  | { outcome: 'ok'; transformed: number }
  | { outcome: 'error'; reason: string }

export type MigrationMeta = {
  currentVersion: MigrationVersion
  appliedAt: Timestamp
}
