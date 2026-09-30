# English / French display translations

The sidebar language selector changes the UI without remounting views. Its
choice is stored in `pal-lab.language`. A French browser initially uses French;
other browser languages fall back to English. Both dictionaries ship with the
app, with no runtime calls to Palpedia or a translation service.

- `ui-fr.json`: French translations of English UI strings.
- `game-fr.json`: localized game display names, descriptions and rank templates.
- `game-ids-fr.json`: game names indexed by stable passive / active-skill IDs.

English source strings are the fallback for missing translations. Calls to `t`
normalize whitespace for lookup while preserving surrounding whitespace;
numbered `{0}` parameters insert values without translating user input.
`tr` handles labels which may also be booleans or React nodes. Components using
these helpers subscribe through `useLocale()`, including memoized roster rows.
`matchesText()` searches English and French names with case and accent folding.

Translate presentation text only. Keep species IDs, passive IDs, request fields,
solver inputs, player names, nicknames, world names and custom plan names intact.
For new UI strings, add an English source key and its French value to
`ui-fr.json`. For game data, match EN/FR reference entries by internal IDs or
identical species slugs, then add aliases for the current pack's display names.
Preserve every numbered slot in partner rank templates, including repeated
slots. The unit test checks these against the bundled game pack.

French game terminology was referenced from Palpedia on 2026-09-30. Source
links and attribution are in the root `THIRD-PARTY-NOTICES.md`. Palpedia's
editorial guides, site code and artwork are not included.

Validation from `app/`:

```sh
bun test
bunx tsc --noEmit
bunx vite build
# With the normal generated wasm package present:
bunx vite build --mode web
```

The optional browser smoke test uses the existing fixture backend, so it needs
no private save or running game server. Start `bun run dev`, install Playwright
in your test environment, then run from the repository root:

```sh
node scripts/test-i18n.cjs http://localhost:1420
```

`PAL_LAB_PLAYWRIGHT_MODULE` and `PAL_LAB_CHROMIUM` can select an existing
Playwright installation and Chromium executable. They are optional.
