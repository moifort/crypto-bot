# Crypto Bot - Project Directives

## Build & Verification Commands

- **Backend typecheck**: `bun tsc --noEmit`
- **Regenerate types** (if routes changed): `bunx nitro prepare` (run before `bun tsc`)
- **Linter**: `bunx biome check`
- **Runtime**: always use `bun`/`bunx`, never `npm`/`npx`
- **iOS UI tests**: `xcodebuild test -project ios/CryptoBot.xcodeproj -scheme CryptoBot -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:CryptoBotUITests` (requires `bun dev` running)

## Development Workflow

1. Always verify the build before committing (backend `bun tsc --noEmit`)
2. Run `bunx nitro prepare` before `bun tsc` if routes were added/modified
3. After each completed task: run an expert code review before proposing the commit
4. After each completed task: request user validation BEFORE committing

## Backend Patterns (TypeScript/Nitro)

- Domain architecture: `server/domain/{domain}/types.ts`, `primitives.ts`, `repository.ts`, `command.ts`, `query.ts`
- Branded types with `ts-brand` + Zod validation constructors in `primitives.ts`
- Discriminated unions for errors (no exceptions)
- File-based storage: `useStorage('grid')`, `useStorage('orders')`, `useStorage('trades')`, `useStorage('snapshots')`
- Formatter: Biome (spaces, single quotes, no semicolons, line width 100)
- Exchange API: Kraken REST with native fetch + Web Crypto (no CCXT)
- Pair: XBTUSDC (Kraken uses XBT, not BTC)
