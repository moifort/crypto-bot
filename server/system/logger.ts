import { consola } from 'consola'

consola.options.formatOptions.date = true
consola.options.formatOptions.columns = consola.options.formatOptions.columns || 80

for (const reporter of consola.options.reporters) {
  if ('formatDate' in reporter) {
    reporter.formatDate = (date: Date, opts: { date?: boolean }) =>
      opts.date ? date.toLocaleTimeString('en-GB') : ''
  }
}

export const createLogger = (tag: string) => consola.withTag(tag)
