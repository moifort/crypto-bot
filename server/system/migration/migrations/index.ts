import type { Migration } from '../types'
import { migration0001 } from './0001-recalculate-trade-profits'

export const migrations: Migration[] = [migration0001]
