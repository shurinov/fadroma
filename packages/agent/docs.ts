#!/usr/bin/env -S node --import=@ganesha/esbuild
import { readFileSync } from 'node:fs'
import { generateDocumentation } from '@hackbg/docs'
generateDocumentation({
  data: JSON.parse(readFileSync('docs.json', 'utf8')),
  pages: {
    'core.md':       { sources: ['core.ts'] },
    'chain.md':      { sources: ['chain.ts'] },
    'deploy.md':     { sources: ['deploy.ts'] },
    'governance.md': { sources: ['governance.ts'] },
    'program.md':    { sources: ['program.browser.ts', 'program.ts'] },
    'staking.md':    { sources: ['staking.ts'] },
    'store.md':      { sources: ['store.ts'] },
    'stub.md':       { sources: ['stub.ts'] },
    'token.md':      { sources: ['token.ts'] },
    'tx.md':         { sources: ['tx.ts'] },
  }
})
