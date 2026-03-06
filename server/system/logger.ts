import { consola } from 'consola'

consola.options.formatOptions.date = true
consola.options.formatOptions.columns = 80

export const createLogger = (tag: string) => consola.withTag(tag)
