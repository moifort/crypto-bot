import type { Migration } from '../types'
import { migration0001 } from './0001-recalculate-trade-profits'
import { migration0002 } from './0002-purge-corrupted-trades'

export const migrations: Migration[] = [migration0001, migration0002]
