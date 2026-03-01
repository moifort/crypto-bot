import { make } from 'ts-brand'
import { z } from 'zod'
import type {
  MigrationName as MigrationNameType,
  MigrationVersion as MigrationVersionType,
} from './types'

export const MigrationVersion = (value: unknown) => {
  const v = z.number().int().nonnegative().parse(value)
  return make<MigrationVersionType>()(v)
}

export const MigrationName = (value: unknown) => {
  const v = z.string().min(1).parse(value)
  return make<MigrationNameType>()(v)
}
